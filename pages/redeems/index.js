import { getRedeemRecords } from "../../api/profile.js"

Page({
  data: {
    list: [],
    activeTab: 0, // 0: 未兑换, 1: 已兑换
    tabs: [
      { label: '待核销', value: 'unredeemed' },
      { label: '已核销', value: 'redeemed' }
    ],
    page: 1,
    size: 20
  },
  onShow() {
    this.loadRecords()
  },
  // 切换tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    if (index !== this.data.activeTab) {
      this.setData({
        activeTab: index,
        list: [],
        page: 1
      }, () => {
        this.loadRecords()
      })
    }
  },
  async loadRecords() {
    try {
      const status = this.data.tabs[this.data.activeTab].value
      const res = await getRedeemRecords(status, this.data.page, this.data.size)
      const records = res && res.data && Array.isArray(res.data.records) ? res.data.records : []

      // 从服务器获取的记录
      const list = records.map(r => ({
        id: r.id,
        item: r.itemName,
        time: r.createdAt ? r.createdAt.replace('T', ' ').slice(0, 16) : '',
        place: r.placeName,
        code: r.code,
        isRedeemed: r.isRedeemed || false, // 确保有默认值
        points: 0
      }))

      this.setData({ list })
    } catch (e) {
      console.error('加载服务器记录失败:', e)
      wx.showToast({ title: "加载失败", icon: "none" })
      this.setData({ list: [] })
    }
  },
  // 复制兑换码
  copyCode(e) {
    const code = e.currentTarget.dataset.code
    if (!code) {
      wx.showToast({ title: "无兑换码", icon: "none" })
      return
    }

    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: `兑换码已复制: ${code}`,
          icon: 'success',
          duration: 2000
        })
      },
      fail: () => {
        wx.showToast({
          title: `兑换码: ${code}`,
          icon: 'none',
          duration: 3000
        })
      }
    })
  }
})
