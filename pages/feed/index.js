Page({
  data: {
    sorts: ["时间", "距离", "点赞", "评论"],
    activeSort: 0,
    sortOpen: false,
    list: [],
    temp_list: [
      { id: 1, user: "游客C", time: "昨天", ts: Date.now()-86400000, content: "打卡罗浮山，风景很美。", photos: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=80"], likes: 12, comments: 3, avatar: "https://randomuser.me/api/portraits/women/65.jpg", lat: 23.2695, lng: 114.1399, place: "冲虚古观" },
      { id: 2, user: "游客D", time: "1小时前", ts: Date.now()-3600000, content: "罗浮山骑行很开心。", photos: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"], likes: 8, comments: 1, avatar: "https://randomuser.me/api/portraits/men/32.jpg", lat: 23.2742, lng: 114.1491, place: "飞云峰" }
    ],
    currentLat: null,
    currentLng: null
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    const stored = wx.getStorageSync('feed') || []
    const list = stored.length ? [...stored] : [...this.data.temp_list]
    this.setData({ list:list })
    wx.getLocation({ type: 'gcj02', success: r => {
      this.setData({ currentLat: r.latitude, currentLng: r.longitude }, () => this.applySort())
    } })
  },
  applySort() {
    const sortIdx = this.data.activeSort
    let arr = [...this.data.list]
    if (sortIdx === 0) {
      arr.sort((a,b) => (b.ts||0)-(a.ts||0))
    } else if (sortIdx === 1) {
      const lat = this.data.currentLat, lng = this.data.currentLng
      arr = arr.map(i => {
        const d = lat && lng && i.lat && i.lng ? this.computeDistance(lat,lng,i.lat,i.lng) : null
        return { ...i, distance: d ? Number(d.toFixed(2)) : '' }
      }).sort((a,b) => (a.distance||1e9)-(b.distance||1e9))
    } else if (sortIdx === 2) {
      arr.sort((a,b) => (b.likes||0)-(a.likes||0))
    } else {
      arr.sort((a,b) => (b.comments||0)-(a.comments||0))
    }
    this.setData({ list: arr })
  },
  onLike(e) {
    const id = e.currentTarget.dataset.id
    const list = this.data.list.map(i => i.id === id ? { ...i, likes: (i.likes||0) + 1 } : i)
    this.setData({ list }, () => this.applySort())
  },
  onComment(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.list.find(i => i.id === id)
    wx.navigateTo({
      url: `/pages/comment/index?id=${id}`,
      success: res => {
        const ec = res.eventChannel
        if (ec && item) ec.emit('post', item)
      }
    })
  },
  toggleSort() { this.setData({ sortOpen: !this.data.sortOpen }) },
  selectSort(e) {
    const idx = Number(e.currentTarget.dataset.index)
    this.setData({ activeSort: idx, sortOpen: false }, () => this.applySort())
  },
  computeDistance(lat1, lng1, lat2, lng2) {
    const toRad = v => v * Math.PI / 180
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
})
