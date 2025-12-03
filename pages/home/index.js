import { getResourceList } from "../../api/home.js";

Page({
  data: {
    searchQuery: "",
    categories: ["景点", "住宿", "餐饮"],
    activeCategory: 0,
    items: [],
    page: 1,
    size: 12
  },
  onLoad() {
    this.updateList()
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },
  onInput(e) {
    this.setData({ searchQuery: e.detail.value }, () => this.updateList())
  },
  onSelectCategory(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ activeCategory: idx }, () => this.updateList())
  },
  async updateList() {
    const fuzzy = (this.data.searchQuery || "").trim()
    const type = this.data.categories[this.data.activeCategory] || 'ALL'
    try {
      const res = await getResourceList(type, fuzzy, this.data.page, this.data.size)
      const records = (res && res.data && Array.isArray(res.data.records)) ? res.data.records : []
      const items = records.map(r => ({
        id: r.id,
        type: 'image',
        title: r.name || '条目',
        src: r.coverImg || '',
        category: r.type || type
      }))
      this.setData({ items })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ items: [] })
    }
  },
  onCardTap(e) {
    const id = Number(e.currentTarget.dataset.id)
    wx.navigateTo({ url: `/pages/poi/detail?id=${id}` })
  },
})
