import { getUserInfo, getRedeemItems, submitRedeemItem } from "../../api/profile.js"

Page({
  data: {
    userPoints: 0,
    items: [],
    page: 1,
    size: 20
  },
  onShow() {
    this.loadUserAndItems()
  },
  async loadUserAndItems() {
    try {
      const userRes = await getUserInfo()
      const user = userRes && userRes.data ? userRes.data : {}
      const points = user.points || 0
      const itemsRes = await getRedeemItems("points_desc", this.data.page, this.data.size)
      const records = itemsRes && itemsRes.data && Array.isArray(itemsRes.data.records) ? itemsRes.data.records : []
      const items = records.map(r => ({
        id: r.id,
        name: r.name,
        points: r.pointsCost,
        place: "",
        cover: r.coverImg,
        lat: null,
        lng: null
      }))
      this.setData({ userPoints: points, items })
    } catch (e) {
      wx.showToast({ title: "加载失败", icon: "none" })
      this.setData({ items: [] })
    }
  },
  async onRedeem(e) {
    const id = Number(e.currentTarget.dataset.id)
    const it = this.data.items.find(i => i.id === id)
    if (!it) return
    // if (this.data.userPoints < it.points) {
    //   wx.showToast({ title: "积分不足", icon: "none" })
    //   return
    // }
    try {
      const res = await submitRedeemItem(id)
      const data = res && res.data ? res.data : {}
      const remain = this.data.userPoints - it.points
      this.setData({ userPoints: remain >= 0 ? remain : 0 })
      wx.showToast({ title: "兑换成功", icon: "success" })
    } catch (e) {
      wx.showToast({ title: "兑换失败", icon: "none" })
    }
  },
  onNavigate(e) {
    const lat = Number(e.currentTarget.dataset.lat)
    const lng = Number(e.currentTarget.dataset.lng)
    if (!lat || !lng) {
      wx.showToast({ title: "暂无位置信息", icon: "none" })
      return
    }
    wx.openLocation({ latitude: lat, longitude: lng, name: "兑换地点" })
  }
})
