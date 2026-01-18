import { getCheckinHistory } from '../../api/checkin.js'

Page({
  data: {
    list: [],
    page: 1,
    size: 20,
    loading: false,
    hasMore: true
  },

  onShow() {
    this.setData({
      list: [],
      page: 1,
      hasMore: true
    }, () => {
      this.fetchCheckinHistory()
    })
  },

  async fetchCheckinHistory() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })

    try {
      const res = await getCheckinHistory(this.data.page, this.data.size)
      console.log('打卡历史API响应:', res)

      const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
      console.log('打卡记录数量:', records.length)

      const formattedList = records.map(record => ({
        id: record.id,
        locationName: record.locationName || '未知地点',
        checkinTime: record.checkinTime || '',
        score: record.score || 0,
        lat: null, // 后端可能没有返回坐标
        lng: null
      }))

      const newList = [...this.data.list, ...formattedList]
      const hasMore = records.length === this.data.size

      this.setData({
        list: newList,
        page: this.data.page + 1,
        hasMore: hasMore,
        loading: false
      })

    } catch (error) {
      console.error('获取打卡历史失败:', error)
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  onNavigate(e) {
    const lat = Number(e.currentTarget.dataset.lat)
    const lng = Number(e.currentTarget.dataset.lng)
    if (lat && lng) {
      wx.openLocation({ latitude: lat, longitude: lng, name: '打卡地点' })
    } else {
      wx.showToast({ title: '暂无位置信息', icon: 'none' })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      list: [],
      page: 1,
      hasMore: true
    }, () => {
      this.fetchCheckinHistory()
      wx.stopPullDownRefresh()
    })
  },

  // 触底加载更多
  onReachBottom() {
    this.fetchCheckinHistory()
  }
})
