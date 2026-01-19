import { getResourceList } from "../../api/home.js";

Page({
  data: {
    searchQuery: "",
    categories: ["景点", "住宿", "餐饮"],
    activeCategory: 0,
    items: [],
    page: 1,
    size: 12,
    total: 0, // 新增：总数据条数
    loading: false, // 新增：加载状态
    noMoreData: false, // 新增：是否没有更多数据
    isRefreshing: false // 新增：下拉刷新状态
  },
  
  onLoad() {
    this.updateList()
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
      noMoreData: false
    }, () => {
      this.updateList().then(() => {
        this.setData({ isRefreshing: false })
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        })
      }).catch(() => {
        this.setData({ isRefreshing: false })
        wx.stopPullDownRefresh()
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
      this.updateList(true).then(() => {
        this.setData({ loading: false })
      }).catch(() => {
        this.setData({ loading: false })
      })
    })
  },
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },
  
  onInput(e) {
    const searchQuery = e.detail.value.trim()
    this.setData({ 
      searchQuery,
      page: 1,
      noMoreData: false
    }, () => this.updateList())
  },
  
  onSelectCategory(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ 
      activeCategory: idx,
      page: 1,
      noMoreData: false
    }, () => this.updateList())
  },
  
  async updateList(isLoadMore = false) {
    const fuzzy = (this.data.searchQuery || "").trim()
    const type = this.data.categories[this.data.activeCategory] || 'ALL'
    
    try {
      const res = await getResourceList(type, fuzzy, this.data.page, this.data.size)
      const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
      const total = (res && res.data && res.data.total) || 0
      
      const items = records.map(r => ({
        id: r.id,
        type: 'image',
        title: r.name || '条目',
        src: r.coverImg || '',
        category: r.type || type
      }))
      
      if (isLoadMore) {
        // 加载更多时，拼接数据
        const combinedItems = [...this.data.items, ...items]
        this.setData({ 
          items: combinedItems,
          total,
          noMoreData: combinedItems.length >= total || items.length < this.data.size
        })
      } else {
        // 非加载更多时，直接替换数据
        this.setData({ 
          items,
          total,
          noMoreData: items.length >= total || items.length < this.data.size
        })
      }
      
      return Promise.resolve()
      
    } catch (err) {
      console.error('加载数据失败:', err)
      wx.showToast({ 
        title: '加载失败', 
        icon: 'none',
        duration: 2000
      })
      
      // 如果是加载更多失败，保持原有数据；否则清空
      this.setData({ 
        items: isLoadMore ? this.data.items : [],
        loading: false,
        isRefreshing: false
      })
      
      return Promise.reject(err)
    }
  },
  
  onCardTap(e) {
    const id = Number(e.currentTarget.dataset.id)
    wx.navigateTo({ url: `/pages/poi/detail?id=${id}` })
  },
  
  onHeroTap() {
    console.log('onHeroTap called')
    try {
      wx.navigateTo({
        url: '/pages/poi/intro',
        success: (res) => { console.log('navigateTo success', res) },
        fail: (err) => { console.error('navigateTo fail', err) },
        complete: () => { console.log('navigateTo complete') }
      })
    } catch (e) {
      console.error('navigateTo exception', e)
      wx.showToast({
        title: '页面跳转失败',
        icon: 'error'
      })
    }
  },
  
  // 新增：搜索框清空功能
  onClearSearch() {
    this.setData({
      searchQuery: "",
      page: 1,
      noMoreData: false
    }, () => this.updateList())
  }
})