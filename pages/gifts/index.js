import { getUserInfo, getRedeemItems, submitRedeemItem } from "../../api/profile.js"

Page({
  data: {
    userPoints: 0,
    items: [],
    page: 1,
    size: 20,
    // 兑换成功弹窗
    showRedeemModal: false,
    redeemedItem: null,
    redeemCode: ""
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

      // 兑换成功，显示兑换详情弹窗
      if (data.code) {
        this.setData({
          showRedeemModal: true,
          redeemedItem: {
            name: it.name,
            points: it.points,
            cover: it.cover,
            ...data
          },
          redeemCode: data.code
        })

      } else {
        wx.showToast({ title: "兑换成功", icon: "success" })
      }

      const remain = this.data.userPoints - it.points
      this.setData({ userPoints: remain >= 0 ? remain : 0 })
    } catch (e) {
      wx.showToast({ title: "兑换失败", icon: "none" })
    }
  },
  // 复制兑换码
  copyRedeemCode() {
    const code = this.data.redeemCode
    if (!code) {
      wx.showToast({ title: "无兑换码", icon: "none" })
      return
    }

    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '兑换码已复制',
          icon: 'success',
          duration: 1500
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败，请手动复制',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  // 关闭兑换成功弹窗
  closeRedeemModal() {
    this.setData({
      showRedeemModal: false,
      redeemedItem: null,
      redeemCode: ""
    })
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
