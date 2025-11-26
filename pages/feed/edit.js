Page({
  data: { text: '', images: [], lat: null, lng: null, place: '' },
  onLoad(q) {
    const lat = q && q.lat ? Number(q.lat) : null
    const lng = q && q.lng ? Number(q.lng) : null
    const place = q && q.place ? decodeURIComponent(q.place) : ''
    this.setData({ lat, lng, place })
  },
  onInput(e) {
    this.setData({ text: e.detail.value })
  },
  chooseImages() {
    wx.chooseImage({ count: 9, success: r => {
      const imgs = (r.tempFilePaths || []).slice(0, 9)
      this.setData({ images: imgs })
    }})
  },
  publish() {
    const item = {
      id: Date.now(),
      user: '我',
      time: '刚刚',
      ts: Date.now(),
      content: this.data.text || '分享了一次打卡',
      photos: this.data.images,
      likes: 0,
      comments: 0,
      avatar: wx.getStorageSync('userInfo')?.avatar || 'https://randomuser.me/api/portraits/men/12.jpg',
      lat: this.data.lat,
      lng: this.data.lng,
      place: this.data.place || '未知位置'
    }
    const list = wx.getStorageSync('feed') || []
    list.unshift(item)
    wx.setStorageSync('feed', list)
    wx.showToast({ title: '已发布', icon: 'success' })
    wx.navigateBack()
  }
})
