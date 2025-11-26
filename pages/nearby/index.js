Page({
  data: {
    sorts: ["距离", "热度"],
    activeSort: 0,
    sortOpen: false,
    categories: ["景点", "商家"],
    activeCategory: 0,
    list: [],
    currentLat: null,
    currentLng: null,
    locationName: null,
    spots: [
      { id: 101, name: "冲虚古观", popularity: 95, cover: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80", lat: 23.2695, lng: 114.1399 },
      { id: 102, name: "飞云峰", popularity: 88, cover: "https://images.unsplash.com/photo-1505765051416-678bbd8acb6c?auto=format&fit=crop&w=800&q=80", lat: 23.2742, lng: 114.1491 },
      { id: 103, name: "洗药泉", popularity: 76, cover: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80", lat: 23.2708, lng: 114.1445 },
      { id: 104, name: "白莲湖", popularity: 82, cover: "https://images.unsplash.com/photo-1502920917128-1aa500764df8?auto=format&fit=crop&w=800&q=80", lat: 23.2627, lng: 114.1324 }
    ],
    merchants: [
      { id: 201, name: "罗浮山游客服务中心", popularity: 78, cover: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", lat: 23.2687, lng: 114.1375 },
      { id: 202, name: "山景民宿", popularity: 91, cover: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80", lat: 23.2702, lng: 114.1410 },
      { id: 203, name: "白莲湖茶舍", popularity: 84, cover: "https://images.unsplash.com/photo-1556742393-d75f4687eaf4?auto=format&fit=crop&w=800&q=80", lat: 23.2624, lng: 114.1315 },
      { id: 204, name: "飞云峰山庄", popularity: 73, cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80", lat: 23.2738, lng: 114.1480 }
    ]
  },
  onLoad() {
    wx.getLocation({
      type: 'gcj02',
      success: r => {
        this.setData({ currentLat: r.latitude, currentLng: r.longitude }, () => {
          this.updateList()
          this.getLocationName(r.latitude, r.longitude)
        })
      },
      fail: () => {
        this.updateList()
      }
    })
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },
  onSort(e) {
    const idx = Number(e.detail.value)
    this.setData({ activeSort: idx }, () => this.updateList())
  },
  toggleSort() {
    this.setData({ sortOpen: !this.data.sortOpen })
  },
  selectSort(e) {
    const idx = Number(e.currentTarget.dataset.index)
    this.setData({ activeSort: idx, sortOpen: false }, () => this.updateList())
  },
  onRefreshLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: r => {
        this.setData({ currentLat: r.latitude, currentLng: r.longitude, locationName: null }, () => {
          this.updateList()
          this.getLocationName(r.latitude, r.longitude)
        })
      }
    })
  },
  onChooseLocation() {
    wx.chooseLocation({
      success: r => {
        this.setData({ currentLat: r.latitude, currentLng: r.longitude, locationName: r.name || (r.latitude + ',' + r.longitude) }, () => this.updateList())
      }
    })
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
        const name = res && res.data && res.data.result && res.data.result.address_reference && (res.data.result.address_reference.landmark_l2 && res.data.result.address_reference.landmark_l2.title || res.data.result.address_reference.landmark_l1 && res.data.result.address_reference.landmark_l1.title) || res.data.result && res.data.result.address || ''
        if (name) this.setData({ locationName: name })
      }
    })
  },
  onCategory(e) {
    const idx = Number(e.currentTarget.dataset.index)
    this.setData({ activeCategory: idx }, () => this.updateList())
  },
  updateList() {
    const src = this.data.activeCategory === 0 ? this.data.spots : this.data.merchants
    const sortIdx = this.data.activeSort
    const lat = this.data.currentLat
    const lng = this.data.currentLng
    const arr = src.map(i => {
      let d = i.distance
      if (lat && lng && i.lat && i.lng) {
        d = this.computeDistance(lat, lng, i.lat, i.lng)
      }
      return { ...i, distance: d ? Number(d.toFixed(2)) : '' }
    })
    if (sortIdx === 0) {
      arr.sort((a, b) => (a.distance || 1e9) - (b.distance || 1e9))
    } else {
      arr.sort((a, b) => b.popularity - a.popularity)
    }
    this.setData({ list: arr })
  },
  computeDistance(lat1, lng1, lat2, lng2) {
    const toRad = v => v * Math.PI / 180
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  },
  onDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/poi/detail?id=${id}` })
  },
  onNavigate(e) {
    const lat = Number(e.currentTarget.dataset.lat)
    const lng = Number(e.currentTarget.dataset.lng)
    wx.openLocation({ latitude: lat, longitude: lng, name: "目的地" })
  }
})
