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
    total: 0, // 新增：总数据条数
    loading: false, // 新增：加载更多状态
    noMoreData: false, // 新增：是否没有更多数据
    isRefreshing: false, // 新增：下拉刷新状态
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

    // 清空缓存，重新加载
    this.setData({
      page: 1,
      list: [],
      noMoreData: false,
      isRefreshing: false
    })
    
    wx.getLocation({
      type: 'gcj02',
      success: r => {
        this.setData({ 
          currentLat: r.latitude, 
          currentLng: r.longitude 
        }, () => this.fetchList())
      },
      fail: (err) => {
        this.setData({ 
          currentLat: null, 
          currentLng: null 
        }, () => this.fetchList())
      }
    })
  },
  
  // 新增：下拉刷新
  onPullDownRefresh() {
    this.refreshData()
  },
  
  // 新增：上拉加载更多
  onReachBottom() {
    this.loadMore()
  },
  
  // 新增：刷新数据
  refreshData() {
    if (this.data.isRefreshing) return
    
    this.setData({ 
      isRefreshing: true,
      page: 1,
      noMoreData: false,
      list: []
    }, () => {
      this.fetchList().then(() => {
        this.setData({ isRefreshing: false })
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        })
      }).catch((err) => {
        this.setData({ isRefreshing: false })
        wx.stopPullDownRefresh()
        console.error('刷新失败:', err)
      })
    })
  },
  
  // 新增：加载更多数据
  loadMore() {
    const { loading, noMoreData } = this.data
    if (loading || noMoreData) return
    
    this.setData({ loading: true })
    
    const nextPage = this.data.page + 1
    this.setData({ page: nextPage }, () => {
      this.fetchList(true).then(() => {
        this.setData({ loading: false })
      }).catch(() => {
        this.setData({ loading: false })
      })
    })
  },
  
  async fetchList(isLoadMore = false) {
    const sortIdx = this.data.activeSort
    const sortMap = ['time', 'distance', 'like', 'comment']
    const sortBy = sortMap[sortIdx] || 'time'
    const lat = this.data.currentLat
    const lng = this.data.currentLng

    try {
      const res = await getFeedList('', lat, lng, this.data.page, this.data.size, sortBy)
      const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
      const total = (res && res.data && res.data.total) || 0

      const newList = records.map(r => {
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
          liked: r.liked || false,
          commentList: [],
          distance: null // 用于存储计算后的距离
        }
      })

      // 计算距离（如果按距离排序需要）
      if (sortIdx === 1 && lat && lng) {
        newList.forEach(item => {
          if (item.lat && item.lng) {
            item.distance = this.computeDistance(lat, lng, item.lat, item.lng)
          }
        })
      }

      if (isLoadMore) {
        // 加载更多时，拼接数据
        const combinedList = [...this.data.list, ...newList]
        this.setData({ 
          list: combinedList,
          total,
          noMoreData: combinedList.length >= total || newList.length < this.data.size
        }, async () => {
          // 只加载新数据的评论
          await this.loadNewComments(newList)
          this.applySort()
        })
      } else {
        // 非加载更多时，直接替换数据
        this.setData({ 
          list: newList,
          total,
          noMoreData: newList.length >= total || newList.length < this.data.size
        }, async () => {
          await this.loadAllComments()
          this.applySort()
        })
      }

      return Promise.resolve()
      
    } catch (e) {
      console.error('加载动态失败:', e)
      wx.showToast({ 
        title: '加载失败，请检查网络连接', 
        icon: 'none',
        duration: 2000
      })
      
      // 如果是加载更多失败，保持原有数据；否则清空
      this.setData({ 
        list: isLoadMore ? this.data.list : [],
        loading: false,
        isRefreshing: false
      }, () => this.applySort())
      
      return Promise.reject(e)
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
        // 如果已经有计算过的距离，直接使用
        if (i.distance !== undefined) {
          return { ...i, distanceDisplay: i.distance ? Number(i.distance.toFixed(2)) : '' }
        }
        // 否则重新计算
        const d = lat && lng && i.lat && i.lng ? this.computeDistance(lat, lng, i.lat, i.lng) : null
        return { ...i, distance: d, distanceDisplay: d ? Number(d.toFixed(2)) : '' }
      }).sort((a, b) => {
        const aDist = a.distance || 1e9
        const bDist = b.distance || 1e9
        return aDist - bDist
      })
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
      wx.showToast({ 
        title: '操作失败，请重试', 
        icon: 'none',
        duration: 2000
      })
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
  },
  
  // 发送评论
  async onSendComment() {
    const content = this.data.commentInputValue.trim()
    if (!content) return

    try {
      wx.showLoading({ title: '发送中...', mask: true })

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
        wx.showToast({ 
          title: '评论成功', 
          icon: 'success',
          duration: 1500
        })
      } else {
        throw new Error(result.msg || '评论失败')
      }
    } catch (error) {
      console.error('评论失败:', error)
      wx.showToast({ 
        title: '评论失败', 
        icon: 'none',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
    }
  },
  
  // 加载所有动态的评论
  async loadAllComments() {
    const list = this.data.list
    if (!list || list.length === 0) return

    // 批量加载评论（避免过多请求）
    const batchSize = 3 // 每次加载3个动态的评论
    const batches = []
    
    for (let i = 0; i < list.length; i += batchSize) {
      const batch = list.slice(i, i + batchSize)
      batches.push(batch)
    }

    const updatedList = [...list]
    
    for (const batch of batches) {
      const commentPromises = batch.map(async (item) => {
        if (item.comments > 0 && item.commentList.length === 0) {
          try {
            const res = await getPostComments(item.id, 1, 10)
            const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
            const comments = records.map(r => ({
              id: r.commentId || r.id,
              user: r.nickname || (r.userId ? ('用户' + r.userId) : '游客'),
              time: r.createdAt ? r.createdAt.replace('T', ' ').slice(0, 16) : '',
              content: r.content || '',
              avatar: r.avatarUrl || defAvatar
            }))
            return { postId: item.id, comments }
          } catch (e) {
            console.error(`加载动态 ${item.id} 评论失败:`, e)
            return { postId: item.id, comments: [] }
          }
        }
        return { postId: item.id, comments: item.commentList || [] }
      })

      try {
        const results = await Promise.all(commentPromises)
        
        // 更新这一批动态的评论数据
        results.forEach(result => {
          const index = updatedList.findIndex(item => item.id === result.postId)
          if (index !== -1) {
            updatedList[index] = {
              ...updatedList[index],
              commentList: result.comments
            }
          }
        })
      } catch (e) {
        console.error('批量加载评论失败:', e)
      }
    }

    this.setData({ list: updatedList }, () => this.applySort())
  },
  
  // 加载新数据的评论
  async loadNewComments(newList) {
    const commentPromises = newList.map(async (item) => {
      if (item.comments > 0) {
        try {
          const res = await getPostComments(item.id, 1, 10)
          const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
          const comments = records.map(r => ({
            id: r.commentId || r.id,
            user: r.nickname || (r.userId ? ('用户' + r.userId) : '游客'),
            time: r.createdAt ? r.createdAt.replace('T', ' ').slice(0, 16) : '',
            content: r.content || '',
            avatar: r.avatarUrl || defAvatar
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
      
      // 更新新数据的评论
      const updatedList = this.data.list.map(item => {
        const result = results.find(r => r.postId === item.id)
        if (result && !item.commentList?.length) {
          return {
            ...item,
            commentList: result.comments
          }
        }
        return item
      })

      this.setData({ list: updatedList })
    } catch (e) {
      console.error('加载新评论失败:', e)
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
        avatar: r.avatarUrl || defAvatar
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
  
  toggleSort() { 
    this.setData({ sortOpen: !this.data.sortOpen }) 
  },
  
  selectSort(e) {
    const idx = Number(e.currentTarget.dataset.index)
    this.setData({ 
      activeSort: idx, 
      sortOpen: false,
      page: 1,
      noMoreData: false,
      list: []
    }, () => this.fetchList())
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
  },
  
  // 新增：点击动态项查看详情
  onPostTap(e) {
    const id = e.currentTarget.dataset.id
    // 可以跳转到动态详情页
    // wx.navigateTo({
    //   url: `/pages/feed/detail?id=${id}`
    // })
  }
})