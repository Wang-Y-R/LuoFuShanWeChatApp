Page({
  data: {
    searchQuery: "",
    tabs: ["景点", "住宿", "餐饮"],
    activeTab: 0,
    list: [
      { id: 1, name: "冲虚古观", rating: 4.8, cover: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", fav: false, lat: 23.2695, lng: 114.1399 },
      { id: 2, name: "飞云峰", rating: 4.7, cover: "https://images.unsplash.com/photo-1505765051416-678bbd8acb6c?auto=format&fit=crop&w=1200&q=80", fav: false, lat: 23.2742, lng: 114.1491 }
    ]
  },
  onInput(e) {
    this.setData({ searchQuery: e.detail.value })
  },
  onTab(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ activeTab: idx })
  },
  onFav(e) {
    const id = e.currentTarget.dataset.id
    const list = this.data.list.map(i => i.id === id ? { ...i, fav: !i.fav } : i)
    this.setData({ list })
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
