import { getCheckinLocations, submitCheckin } from "../../api/checkin.js"
import { todayHasCheckedIn, addTodayCheckin } from "../../data/todayCheckins.js"
import { formatDateTime } from '../../utils/date.js'

Page({
  data: {
    latitude: 23.4701, // 🚀 修正: 保持为用户实际位置 (用于距离计算和蓝点)
    longitude: 114.2832, // 🚀 修正: 保持为用户实际位置 (用于距离计算和蓝点)
    centerLat: 23.4701, // 🚀 新增: 地图中心点坐标 (用于地图视野)
    centerLng: 114.2832, // 🚀 新增: 地图中心点坐标 (用于地图视野)
    checkedIn: false,
    markers: [],
    selectedLat: null,
    selectedLng: null,
    selectedLocationId: null,
    locationName: null,
    showFeedback: false,
    feedbackPlace: ''
  },

  onReady() {
    this.mapCtx = wx.createMapContext('map')
  },

  onLoad() {
    this.ensureLocationAuth(() => {
      wx.getLocation({
        type: "gcj02",
        success: async res => {
          // 🚀 修正: 同时更新用户位置和地图中心
          this.setData({
            latitude: res.latitude,
            longitude: res.longitude,
            selectedLat: res.latitude,
            selectedLng: res.longitude,
            centerLat: res.latitude, // 地图中心设置为当前位置
            centerLng: res.longitude // 地图中心设置为当前位置
          })
          this.getLocationName(res.latitude, res.longitude)
          // TODO 现在这里默认是分页查询，1页10个点，但目前只有8个点所以这里直接覆盖了
          let result = await getCheckinLocations()
          this.availablePoints = result.data
          this.loadMarkers()
        },
        fail: () => {
          wx.showToast({ title: "定位失败", icon: "none" })
        }
      })
    })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  onLocate() {
    this.ensureLocationAuth(() => {
      wx.getLocation({
        type: "gcj02",
        success: res => {
          // 🚀 修正: 同时更新用户位置和地图中心
          this.setData({
            latitude: res.latitude,
            longitude: res.longitude,
            selectedLat: res.latitude,
            selectedLng: res.longitude,
            centerLat: res.latitude, // 地图中心设置为当前位置
            centerLng: res.longitude // 地图中心设置为当前位置
          })

          this.getLocationName(res.latitude, res.longitude)
          this.loadMarkers()
        },
        fail: () => {
          wx.showToast({ title: "定位失败", icon: "none" })
        }
      })
    })
  },

  ensureLocationAuth(cb) {
    wx.getSetting({
      success: s => {
        if (s.authSetting && s.authSetting["scope.userLocation"]) {
          cb && cb()
        } else {
          wx.authorize({
            scope: "scope.userLocation",
            success: () => cb && cb(),
            fail: () => {
              wx.showModal({
                content: "需要开启定位权限以显示当前位置",
                confirmText: "去设置",
                success: r => {
                  if (r.confirm) {
                    wx.openSetting({})
                  }
                }
              })
            }
          })
        }
      }
    })
  },

  onMapTap(e) {
    const lat = e && e.detail && e.detail.latitude
    const lng = e && e.detail && e.detail.longitude
    if (lat && lng) {
      this.setData({ selectedLat: lat, selectedLng: lng })
      this.getLocationName(lat, lng)
      this.loadMarkers()
    } else if (this.mapCtx) {
      this.mapCtx.getCenterLocation({
        success: r => {
          // 🚀 修正: 当拖动或点击地图，更新选中位置，并将地图中心也设置为选中位置
          this.setData({
            selectedLat: r.latitude,
            selectedLng: r.longitude,
            centerLat: r.latitude,
            centerLng: r.longitude
          })
          this.getLocationName(r.latitude, r.longitude)
          this.loadMarkers()
        }
      })
    }
  },

  onPickLocation() {
    this.ensureLocationAuth(() => {
      wx.chooseLocation({
        success: r => {
          // 🚀 修正: 仅在选择位置时更新选中位置和地图中心 (用户位置latitude/longitude不变)
          this.setData({
            selectedLat: r.latitude,
            selectedLng: r.longitude,
            centerLat: r.latitude,
            centerLng: r.longitude,
            locationName: r.name || null
          })
          this.loadMarkers()
        }
      })
    })
  },

  onCheckin() {
    const lat = this.data.selectedLat || this.data.latitude
    const lng = this.data.selectedLng || this.data.longitude

    // find nearest predefined point to this selected location
    const nearest = this.findNearestPoint(lat, lng)
    if (!nearest || nearest.dist > 50) {
      wx.showToast({ title: '距离打卡点超过50米，无法打卡', icon: 'none' })
      return
    }

    const p = nearest.point
    const name = p.name || this.data.locationName || '打卡点'
    if (this.isPointChecked(p)) {
      wx.showToast({ title: '打卡点今日已打卡', icon: 'none' })
      return
    }
    // 调用打卡接口
    submitCheckin(p.id, formatDateTime(new Date()))
      .then(res => {
        if (res.code === 200) {
          wx.showToast({ title: '打卡成功', icon: 'success', duration: 1200 })
          this.setData({ checkedIn: true, feedbackPlace: name, showFeedback: true })
          setTimeout(() => this.setData({ checkedIn: false }), 1200)
          addTodayCheckin(p.id)
          this.loadMarkers()
        } else {
          wx.showToast({ title: '打卡失败', icon: 'none' })
        }
      })
      .catch(() => {
        wx.showToast({ title: '打卡失败', icon: 'none' })
      })
  },

  // When user taps marker
  onMarkerTap(e) {
    const id = e && e.markerId
    if (id == null) return
    const pts = this.availablePoints || []
    const p = pts.find(x => x.id === id)
    if (!p) return

    // curLat/curLng 始终使用用户实际位置 (this.data.latitude/longitude)
    const curLat = this.data.latitude
    const curLng = this.data.longitude
    const dist = this.getDistance(curLat, curLng, p.latitude, p.longitude)
    const checked = this.isPointChecked(p)
    const title = `${p.name || '打卡点'}\n距离：${dist > 1000 ? (dist / 1000).toFixed(2) + 'km' : Math.round(dist) + 'm'}\n状态：${checked ? '已打卡' : '未打卡'}`
    if (checked) {
      wx.showModal({ title: '打卡点信息', content: title, showCancel: false })
    } else {
      wx.showModal({
        title: '打卡点信息',
        content: title,
        confirmText: '打卡',
        success: r => {
          if (r.confirm) this.checkinPoint(p)
        }
      })
    }
  },

  // mark a point as checked
  checkinPoint(p) {
    const curLat = this.data.latitude // 始终使用用户实际位置
    const curLng = this.data.longitude // 始终使用用户实际位置
    const dist = this.getDistance(curLat, curLng, p.latitude, p.longitude)

    if (dist > 50) {
      wx.showToast({ title: '不在打卡范围（50m）', icon: 'none' })
      return
    }
    if (this.isPointChecked(p)) {
      wx.showToast({ title: '打卡点今日已打卡', icon: 'none' })
      return
    }
    // 调用打卡接口
    submitCheckin(p.id, formatDateTime(new Date()))
      .then(res => {
        if (res.code === 200) {
          wx.showToast({ title: '打卡成功', icon: 'success', duration: 1200 })
          this.setData({ checkedIn: true, feedbackPlace: name, showFeedback: true })
          setTimeout(() => this.setData({ checkedIn: false }), 1200)
          addTodayCheckin(p.id)
          this.loadMarkers()

        } else {
          wx.showToast({ title: '打卡失败', icon: 'none' })
        }
      })
      .catch(() => {
        wx.showToast({ title: '打卡失败', icon: 'none' })
      })
    this.setData({ feedbackPlace: p.name || '', showFeedback: true })
    this.loadMarkers()
  },

  onShare() {
    const lat = this.data.selectedLat || this.data.latitude
    const lng = this.data.selectedLng || this.data.longitude
    const name = encodeURIComponent(this.data.locationName || '')
    const url = `/pages/feed/edit?lat=${lat}&lng=${lng}&place=${name}`

    wx.navigateTo({
      url,
      success: () => { },
      fail: () => {
        wx.showToast({ title: '无法打开发布页', icon: 'none' })
      }
    })
  },

  onShareFromFeedback() {
    const lat = this.data.selectedLat || this.data.latitude
    const lng = this.data.selectedLng || this.data.longitude
    const name = encodeURIComponent(this.data.locationName || this.data.feedbackPlace || '')
    const locationId = this.data.selectedLocationId
    const url = `/pages/feed/edit?lat=${lat}&lng=${lng}&place=${name}&locationId=${locationId}`

    wx.navigateTo({
      url,
      fail: () => wx.showToast({ title: '无法打开发布页', icon: 'none' })
    })
  },

  hideFeedback() {
    this.setData({ showFeedback: false })
  },

  getLocationName(lat, lng) {
    const app = getApp()
    const key = app && app.globalData && app.globalData.mapKey
    if (!key) return

    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      method: 'GET',
      data: { location: `${lat},${lng}`, key },
      success: res => {
        const name = res && res.data && res.data.result && res.data.result.address_reference &&
          (res.data.result.address_reference.landmark_l2 && res.data.result.address_reference.landmark_l2.title ||
            res.data.result.address_reference.landmark_l1 && res.data.result.address_reference.landmark_l1.title) ||
          res.data.result && res.data.result.address || ''
        if (name) this.setData({ locationName: name })
      }
    })
  },

  // Load available points and build marker list
  loadMarkers() {
    const markers = this.availablePoints.map(p => {
      const checked = this.isPointChecked(p)
      return {
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude,
        width: 34,
        height: 34,
        // use callout background to distinguish status
        callout: {
          content: p.name,
          color: '#ffffff',
          fontSize: 12,
          borderRadius: 6,
          padding: 6,
          display: 'ALWAYS',
          bgColor: checked ? '#16a34a' : '#9ca3af'
        }
      }
    })

    // TODO 用户自己点的打卡位置，理论上不可以
    if (this.data.selectedLat && this.data.selectedLng) {
      markers.push({
        id: 999,
        latitude: this.data.selectedLat,
        longitude: this.data.selectedLng,
        width: 28,
        height: 28,
        title: '选中位置'
      })
    }

    // 更新打卡地点表
    const places = this.availablePoints.map(p => {
      // TODO 这里现在为了展示效果，改成用手选的地点来计算位置
      const dist = this.getDistance(this.data.selectedLat, this.data.selectedLng, p.latitude, p.longitude)
      return {
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        dist: dist,
        distanceText: dist > 1000 ? (dist / 1000).toFixed(2) + 'km' : Math.round(dist) + 'm',
        checked: this.isPointChecked(p)
      }
    })
    places.sort((a, b) => a.dist - b.dist)

    this.setData({ markers, availablePlaces: places })
  },

  // find nearest predefined point to given coordinates
  findNearestPoint(lat, lng) {
    const pts = this.availablePoints || []
    if (!pts.length) return null

    let best = null
    for (const p of pts) {
      const d = this.getDistance(lat, lng, p.latitude, p.longitude)
      if (!best || d < best.dist) best = { point: p, dist: d }
    }
    return best
  },

  //TODO 用户手动选择打卡位置 理论上是不可以的，目前拿来测试
  onSelectPlace(e) {
    const id = e && e.currentTarget && Number(e.currentTarget.dataset.id)
    if (!id) return

    const p = (this.availablePoints || []).find(x => x.id === id)
    if (!p) return

    // 如果该点今日已打卡，则不允许再次选择（或进入打卡），并提示
    if (this.isPointChecked(p)) {
      wx.showToast({ title: '该地点今日已打卡', icon: 'none' })
      return
    }

    //将地图中心 (centerLat/centerLng) 移动到这个点，但保持用户位置不变
    this.setData({
      selectedLat: p.latitude,
      selectedLng: p.longitude,
      selectedLocationId: p.id,
      centerLat: p.latitude,
      centerLng: p.longitude
    })
    this.loadMarkers()
  },

  isPointChecked(p) {
    return todayHasCheckedIn(p.id)
  },

  getDistance(lat1, lng1, lat2, lng2) {
    const toRad = d => d * Math.PI / 180
    const R = 6378137
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lng2 - lng1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
})