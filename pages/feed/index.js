import { getFeedList } from "../../api/feed.js";

Page({
  data: {
    sorts: ["时间", "距离", "点赞", "评论"],
    activeSort: 0,
    sortOpen: false,
    list: [],
    page: 1,
    size: 10,
    currentLat: null,
    currentLng: null
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    wx.getLocation({ type: 'gcj02', success: r => {
      this.setData({ currentLat: r.latitude, currentLng: r.longitude }, () => this.fetchList())
    }, fail: () => { this.fetchList() } })
  },
  async fetchList() {
    const sortIdx = this.data.activeSort
    const sortMap = ['time','distance','like','comment']
    const sortBy = sortMap[sortIdx] || 'time'
    const lat = this.data.currentLat
    const lng = this.data.currentLng
    try {
      const res = await getFeedList('', lat || null, lng || null, this.data.page, this.data.size, sortBy)
      const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
      const list = records.map(r => {
        const ts = r.postTime ? new Date(r.postTime).getTime() : Date.now()
        const tstr = r.postTime ? (r.postTime.replace('T',' ').slice(0,16)) : ''
        return {
          id: r.id,
          user: r.nickname || '游客',
          time: tstr,
          ts: ts,
          content: r.title || '',
          photos: Array.isArray(r.images) ? r.images : [],
          likes: r.likeCount || 0,
          comments: r.commentCount || 0,
          avatar: r.avatarUrl || defAvatar,
          lat: r.latitude || null,
          lng: r.longitude || null,
          place: r.locationName || ''
        }
      })
      this.setData({ list }, () => this.applySort())
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ list: [] }, () => this.applySort())
    }
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
    this.setData({ activeSort: idx, sortOpen: false }, () => this.fetchList())
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
