import { getNearbyList } from "../../api/nearby.js";

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
    page: 1,
    size: 10,
    total: 0, // 新增：总数据条数
    loading: false, // 新增：加载状态
    noMoreData: false // 新增：是否没有更多数据
  },
  onLoad() {
    wx.getLocation({
      type: 'gcj02',
      success: r => {
        this.setData({ 
          currentLat: r.latitude, 
          currentLng: r.longitude,
          page: 1, // 重置页码
          noMoreData: false
        }, () => {
          this.updateList()
          this.getLocationName(r.latitude, r.longitude)
        })
      },
      fail: () => {
        this.updateList()
      }
    })
  },
  
  // 新增：下拉刷新
  onPullDownRefresh() {
    this.refreshData()
  },
  
  // 新增：上拉加载更多
  onReachBottom() {
    this.loadMore()
  },
  
  // 新增：刷新数据
  refreshData() {
    this.setData({ 
      page: 1,
      noMoreData: false,
      loading: false
    }, () => {
      this.updateList().then(() => {
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '刷新成功',
          icon: 'success'
        })
      })
    })
  },
  
  // 新增：加载更多数据
  loadMore() {
    const { loading, noMoreData } = this.data
    if (loading || noMoreData) return
    
    this.setData({ loading: true })
    
    const nextPage = this.data.page + 1
    this.setData({ page: nextPage }, () => {
      this.updateList(true).then(() => {
        this.setData({ loading: false })
      })
    })
  },
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },
  
  onSort(e) {
    const idx = Number(e.detail.value)
    this.setData({ 
      activeSort: idx,
      page: 1,
      noMoreData: false
    }, () => this.updateList())
  },
  
  toggleSort() {
    this.setData({ sortOpen: !this.data.sortOpen })
  },
  
  selectSort(e) {
    const idx = Number(e.currentTarget.dataset.index)
    this.setData({ 
      activeSort: idx, 
      sortOpen: false,
      page: 1,
      noMoreData: false
    }, () => this.updateList())
  },
  
  onRefreshLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: r => {
        this.setData({ 
          currentLat: r.latitude, 
          currentLng: r.longitude, 
          locationName: null,
          page: 1,
          noMoreData: false
        }, () => {
          this.updateList()
          this.getLocationName(r.latitude, r.longitude)
        })
      }
    })
  },
  
  onChooseLocation() {
    wx.chooseLocation({
      success: r => {
        this.setData({ 
          currentLat: r.latitude, 
          currentLng: r.longitude, 
          locationName: r.name || (r.latitude + ',' + r.longitude),
          page: 1,
          noMoreData: false
        }, () => this.updateList())
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
    this.setData({ 
      activeCategory: idx,
      page: 1,
      noMoreData: false
    }, () => this.updateList())
  },
  
  async updateList(isLoadMore = false) {
    const lat = this.data.currentLat
    const lng = this.data.currentLng
    if (!lat || !lng) {
      wx.showToast({ title: '定位失败，无法获取附近数据', icon: 'none' })
      this.setData({ list: [] })
      return Promise.resolve()
    }
    
    const type = this.data.categories[this.data.activeCategory] || '景点'
    const sortBy = this.data.sorts[this.data.activeSort] === '热度' ? 'hot' : 'distance'
    
    try {
      const res = await getNearbyList(type, lat, lng, this.data.page, this.data.size, sortBy)
      const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
      const total = (res && res.data && res.data.total) || 0
      
      const newList = records.map(r => {
        const km = typeof r.distance === 'number' ? Number((r.distance / 1000).toFixed(2)) : ''
        return {
          id: r.id,
          name: r.name || r.title || '附近资源',
          popularity: r.hotScore || 0,
          cover: r.coverImg || '',
          distance: km,
          lat: r.latitude || r.lat || null,
          lng: r.longitude || r.lng || null
        }
      })
      
      if (isLoadMore) {
        // 加载更多时，拼接数据
        const combinedList = [...this.data.list, ...newList]
        this.setData({ 
          list: combinedList,
          total,
          noMoreData: combinedList.length >= total || newList.length < this.data.size
        })
      } else {
        // 非加载更多时，直接替换数据
        this.setData({ 
          list: newList,
          total,
          noMoreData: newList.length >= total || newList.length < this.data.size
        })
      }
      
      return Promise.resolve()
      
    } catch (err) {
      console.error('加载数据失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ 
        list: isLoadMore ? this.data.list : [],
        loading: false
      })
      return Promise.reject(err)
    }
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
    const lat = e.currentTarget.dataset.lat
    const lng = e.currentTarget.dataset.lng
    if (lat && lng) {
      wx.navigateTo({ url: `/pages/poi/detail?id=${id}&lat=${lat}&lng=${lng}` })
    } else {
      wx.navigateTo({ url: `/pages/poi/detail?id=${id}` })
    }
  }
})
