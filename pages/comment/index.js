Page({
  data: {
    postId: null,
    comments: [
      { id: 1, user: "游客E", time: "刚刚", content: "不错的景点。", avatar: "https://via.placeholder.com/128" },
      { id: 2, user: "游客F", time: "5分钟前", content: "服务很好。", avatar: "https://via.placeholder.com/128" }
    ],
    inputValue: ""
  },
  onLoad(q) {
    if (q && q.postId) {
      this.setData({ postId: q.postId })
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
