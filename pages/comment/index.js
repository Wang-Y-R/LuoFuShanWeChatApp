Page({
  data: {
    postId: null,
    post: null,
    comments: [
      { id: 1, user: "游客E", time: "刚刚", content: "不错的景点。", avatar: "https://via.placeholder.com/128" },
      { id: 2, user: "游客F", time: "5分钟前", content: "服务很好。", avatar: "https://via.placeholder.com/128" }
    ],
    inputValue: ""
  },
  onLoad(q) {
    const id = q && (q.id || q.postId) ? Number(q.id || q.postId) : null
    if (id) this.setData({ postId: id })
    //用通道传入动态信息，不用重复获取
    const ec = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (ec) {
      ec.on('post', data => {
        if (data) this.setData({ post: data, postId: data.id || this.data.postId })
      })
    }
    if (!this.data.post && id) {
      const stored = wx.getStorageSync('feed') || []
      const post = stored.find(i => i.id === id) || null
      if (post) this.setData({ post })
    }
  },
  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },
  onSubmit() {
    const v = this.data.inputValue.trim()
    if (!v) return
    const next = { id: Date.now(), user: "我", time: "刚刚", content: v, avatar: "https://via.placeholder.com/128" }
    this.setData({ comments: [next, ...this.data.comments], inputValue: "" })
  }
})
