import { getRankList, getMyRank } from "../../api/checkin.js";

Page({
  data: {
    tabs: ["日", "周", "月"],
    typeMap: ["day", "week", "month"],
    activeTab: 0,
    list: [],
    page: 1,
    size: 20,
    total: 0,
    loading: false,
    refreshing: false,
    myRank: null
  },

  onLoad() {
    this.loadData(true)
  },

  onTab(e) {
    const idx = Number(e.currentTarget.dataset.index)
    if (idx === this.data.activeTab) return
    this.setData({ activeTab: idx, list: [], page: 1, total: 0 }, () => {
      this.loadData(true)
    })
  },

  async loadData(isRefresh = false) {
    const type = this.data.typeMap[this.data.activeTab] || 'week'
    const page = isRefresh ? 1 : this.data.page
    this.setData({ loading: true })
    try {
      const res = await getRankList(type, page, this.data.size)
      const data = res && res.data ? res.data : {}
      const records = Array.isArray(data.records) ? data.records : []
      const nextList = isRefresh ? records : (this.data.list.concat(records))
      this.setData({
        list: nextList,
        total: data.total || 0,
        page: page + 1
      })
      // load my rank
      const meRes = await getMyRank(type)
      const meData = meRes && meRes.data ? meRes.data : null
      this.setData({ myRank: meData })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false, refreshing: false })
      if (isRefresh) wx.stopPullDownRefresh && wx.stopPullDownRefresh()
    }
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true, page: 1 }, () => this.loadData(true))
  },

  onReachBottom() {
    if (this.data.loading) return
    if (this.data.list.length >= this.data.total) return
    this.loadData(false)
  },

  // 点击卡片可跳转到用户详情或其他行为（占位）
  onUserTap(e) {
    const userId = e.currentTarget.dataset.userid
    // placeholder: 可以实现跳转到用户详情页
    console.log('用户点击', userId)
  }
})
