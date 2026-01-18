import { getFeedList, togglePostLike, getPostComments, sendPostComment } from "../../api/feed.js";

const defAvatar = "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";

Page({
  data: {
    sorts: ["时间", "距离", "点赞", "评论"],
    activeSort: 0,
    sortOpen: false,
    list: [],
    page: 1,
    size: 10,
    currentLat: null,
    currentLng: null,
    // 评论相关状态
    showCommentInput: false,
    currentCommentPostId: null,
    commentInputValue: ""
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }

    wx.getLocation({
      type: 'gcj02',
      success: r => {
        this.setData({ currentLat: r.latitude, currentLng: r.longitude }, () => this.fetchList())
      },
      fail: (err) => {
        this.setData({ currentLat: null, currentLng: null }, () => this.fetchList())
      }
    })
  },
  async fetchList() {
    const sortIdx = this.data.activeSort
    const sortMap = ['time', 'distance', 'like', 'comment']
    const sortBy = sortMap[sortIdx] || 'time'
    const lat = this.data.currentLat
    const lng = this.data.currentLng

    try {
      const res = await getFeedList('', lat, lng, this.data.page, this.data.size, sortBy)

      const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []

      const list = records.map(r => {
        const ts = r.postTime ? new Date(r.postTime).getTime() : Date.now()
        const tstr = r.postTime ? (r.postTime.replace('T', ' ').slice(0, 16)) : ''
        return {
          id: r.id,
          user: r.nickname || '游客',
          time: tstr,
          ts: ts,
          content: r.content || '',
          photos: Array.isArray(r.images) ? r.images : [],
          likes: r.likeCount || 0,
          comments: r.commentCount || 0,
          avatar: r.avatarUrl || defAvatar,
          lat: r.latitude || null,
          lng: r.longitude || null,
          place: r.locationName || '',
          liked: r.liked || false, // 使用后端返回的点赞状态
          commentList: [] // 评论列表
        }
      })

      this.setData({ list }, async () => {
        // 默认加载所有动态的评论
        await this.loadAllComments()
        // 确保数据完全设置后再排序
        this.applySort()
      })
    } catch (e) {
      wx.showToast({ title: '加载失败，请检查网络连接', icon: 'none' })
      this.setData({ list: [] }, () => this.applySort())
    }
  },
  applySort() {
    const sortIdx = this.data.activeSort
    let arr = [...this.data.list]

    if (sortIdx === 0) {
      arr.sort((a, b) => (b.ts || 0) - (a.ts || 0))
    } else if (sortIdx === 1) {
      const lat = this.data.currentLat, lng = this.data.currentLng
      arr = arr.map(i => {
        const d = lat && lng && i.lat && i.lng ? this.computeDistance(lat, lng, i.lat, i.lng) : null
        const newItem = { ...i, distance: d ? Number(d.toFixed(2)) : '' }
        return newItem
      }).sort((a, b) => (a.distance || 1e9) - (b.distance || 1e9))
    } else if (sortIdx === 2) {
      arr.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    } else {
      arr.sort((a, b) => (b.comments || 0) - (a.comments || 0))
    }


    this.setData({ list: arr })
  },
  async onLike(e) {
    const id = e.currentTarget.dataset.id
    try {
      // 根据当前UI状态判断操作类型
      const currentItem = this.data.list.find(i => i.id === id)
      const action = currentItem && currentItem.liked ? 'unlike' : 'like'

      const res = await togglePostLike(id, action)
      if (res.code === 200) {
        // 根据接口返回更新点赞状态和数量
        const list = this.data.list.map(i =>
          i.id === id
            ? {
              ...i,
              likes: res.data.likeCount,
              liked: res.data.liked
            }
            : i
        )
        this.setData({ list }, () => this.applySort())
        wx.showToast({
          title: res.data.liked ? '点赞成功' : '已取消点赞',
          icon: 'success',
          duration: 1000
        })
      }
    } catch (error) {
      wx.showToast({ title: '操作失败，请重试', icon: 'none' })
    }
  },
  onComment(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      showCommentInput: true,
      currentCommentPostId: id,
      commentInputValue: ""
    })
  },
  // 隐藏评论输入框
  hideCommentInput() {
    this.setData({
      showCommentInput: false,
      currentCommentPostId: null,
      commentInputValue: ""
    })
  },
  // 评论输入框内容变化
  onCommentInput(e) {
    this.setData({
      commentInputValue: e.detail.value,
      _forceUpdate: Date.now() // 强制更新字段
    })
  },
  // 评论输入框失去焦点
  onCommentBlur(e) {
    // 可以在这里处理失去焦点时的逻辑
    // 如果需要的话可以保持弹窗打开
  },
  // 发送评论
  async onSendComment() {
    const content = this.data.commentInputValue.trim()
    if (!content) return

    try {
      wx.showLoading({ title: '发送中...' })

      const result = await sendPostComment(this.data.currentCommentPostId, content)

      if (result.code === 200) {
        // 重新加载当前动态的评论
        await this.refreshPostComments(this.data.currentCommentPostId)

        // 更新动态的评论数量
        const list = this.data.list.map(item => {
          if (item.id === this.data.currentCommentPostId) {
            return {
              ...item,
              comments: (item.comments || 0) + 1
            }
          }
          return item
        })
        this.setData({ list }, () => this.applySort())

        // 隐藏输入框
        this.hideCommentInput()
        wx.showToast({ title: '评论成功', icon: 'success' })
      } else {
        throw new Error(result.msg || '评论失败')
      }
    } catch (error) {
      wx.showToast({ title: '评论失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },
  // 加载所有动态的评论
  async loadAllComments() {
    const list = this.data.list
    if (!list || list.length === 0) return

    // 并行加载所有动态的评论
    const commentPromises = list.map(async (item) => {
      if (item.comments > 0) { // 只有有评论的动态才加载
        try {
          const res = await getPostComments(item.id, 1, 10)
          const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
          const comments = records.map(r => ({
            id: r.commentId || r.id,
            user: r.nickname || (r.userId ? ('用户' + r.userId) : '游客'),
            time: r.createdAt ? r.createdAt.replace('T', ' ').slice(0, 16) : '',
            content: r.content || '',
            avatar: r.avatarUrl || 'https://via.placeholder.com/128'
          }))
          return { postId: item.id, comments }
        } catch (e) {
          console.error(`加载动态 ${item.id} 评论失败:`, e)
          return { postId: item.id, comments: [] }
        }
      }
      return { postId: item.id, comments: [] }
    })

    try {
      const results = await Promise.all(commentPromises)

      // 更新所有动态的评论数据
      const updatedList = list.map(item => {
        const result = results.find(r => r.postId === item.id)
        return {
          ...item,
          commentList: result ? result.comments : []
        }
      })

      this.setData({ list: updatedList }, () => this.applySort())
    } catch (e) {
      console.error('批量加载评论失败:', e)
    }
  },
  // 刷新指定动态的评论
  async refreshPostComments(postId) {
    try {
      const res = await getPostComments(postId, 1, 10)
      const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
      const comments = records.map(r => ({
        id: r.commentId || r.id,
        user: r.nickname || (r.userId ? ('用户' + r.userId) : '游客'),
        time: r.createdAt ? r.createdAt.replace('T', ' ').slice(0, 16) : '',
        content: r.content || '',
        avatar: r.avatarUrl || 'https://via.placeholder.com/128'
      }))

      // 更新指定动态的评论数据
      const list = this.data.list.map(item => {
        if (item.id === postId) {
          return {
            ...item,
            commentList: comments
          }
        }
        return item
      })
      this.setData({ list }, () => this.applySort())
    } catch (e) {
      console.error(`刷新动态 ${postId} 评论失败:`, e)
    }
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
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },
  // 图片预览
  previewImage(e) {
    const urls = e.currentTarget.dataset.urls
    const current = e.currentTarget.dataset.index
    wx.previewImage({
      current: urls[current],
      urls: urls
    })
  }
})
