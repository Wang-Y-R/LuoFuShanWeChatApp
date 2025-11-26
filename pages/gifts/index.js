Page({
  data: {
    userPoints: 80,
    items: [
      { id: 501, name: "纪念徽章", points: 50, place: "游客服务中心", cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80", lat: 23.2687, lng: 114.1375 },
      { id: 502, name: "罗浮山明信片", points: 80, place: "游客服务中心", cover: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80", lat: 23.2687, lng: 114.1375 },
      { id: 503, name: "特色茶叶", points: 120, place: "白莲湖茶舍", cover: "https://images.unsplash.com/photo-1513639725746-64be8b39b43d?auto=format&fit=crop&w=800&q=80", lat: 23.2624, lng: 114.1315 },
      { id: 504, name: "门票优惠券", points: 200, place: "游客服务中心", cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80", lat: 23.2687, lng: 114.1375 }
    ]
  },
  onShow() {
    const u = wx.getStorageSync('userInfo')
    if (!u) {
      wx.showToast({ title: '请先登录', icon: 'none' })
    }
  },
  onRedeem(e) {
    const id = Number(e.currentTarget.dataset.id)
    const it = this.data.items.find(i => i.id === id)
    if (!it) return
    if (this.data.userPoints < it.points) {
      wx.showToast({ title: '积分不足', icon: 'none' })
      return
    }
    const list = wx.getStorageSync('redeems') || []
    list.unshift({ id: Date.now(), item: it.name, time: new Date().toLocaleString(), place: it.place, points: it.points })
    wx.setStorageSync('redeems', list)
    wx.showToast({ title: '兑换成功', icon: 'success' })
  },
  onNavigate(e) {
    const lat = Number(e.currentTarget.dataset.lat)
    const lng = Number(e.currentTarget.dataset.lng)
    wx.openLocation({ latitude: lat, longitude: lng, name: '兑换地点' })
  }
})
