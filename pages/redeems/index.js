import { getRedeemRecords } from "../../api/profile.js"

Page({
  data: {
    list: [],
    status: "redeemed",
    page: 1,
    size: 20
  },
  onShow() {
    this.loadRecords()
  },
  async loadRecords() {
    try {
      const res = await getRedeemRecords(this.data.status, this.data.page, this.data.size)
      const records = res && res.data && Array.isArray(res.data.records) ? res.data.records : []
      const list = records.map(r => ({
        id: r.id,
        item: r.itemName,
        time: r.createdAt,
        place: r.placeName,
        points: 0
      }))
      this.setData({ list })
    } catch (e) {
      wx.showToast({ title: "加载失败", icon: "none" })
      this.setData({ list: [] })
    }
  }
})
