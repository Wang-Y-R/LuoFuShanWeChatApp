import { getPostComments, sendPostComment } from "../../api/feed.js";

Page({
  data: {
    postId: null,
    post: null,
    comments: [],
    page: 1,
    size: 10,
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
    if (this.data.postId) {
      this.fetchComments()
    }
  },
  async fetchComments() {
    try {
      const res = await getPostComments(this.data.postId, this.data.page, this.data.size)
      const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
      const list = records.map(r => ({
        id: r.commentId || r.id,
        user: r.nickname || (r.userId ? ('用户' + r.userId) : '游客'),
        time: r.createdAt ? r.createdAt.replace('T',' ').slice(0,16) : '',
        content: r.content || '',
        avatar: r.avatarUrl || 'https://via.placeholder.com/128'
      }))
      this.setData({ comments: list })
    } catch (e) {
      wx.showToast({ title: '加载评论失败', icon: 'none' })
      this.setData({ comments: [] })
    }
  },
  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },
  async onSubmit() {
    const content = this.data.inputValue.trim()
    if (!content) return

    try {
      wx.showLoading({ title: '发送中...' })

      const result = await sendPostComment(this.data.postId, content)

      if (result.code === 200) {
        // 重新获取评论列表
        await this.fetchComments()
        this.setData({ inputValue: "" })
        wx.showToast({ title: '评论成功', icon: 'success' })
      } else {
        throw new Error(result.msg || '评论失败')
      }
    } catch (error) {
      console.error('评论失败:', error)
      wx.showToast({ title: '评论失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  }
})
