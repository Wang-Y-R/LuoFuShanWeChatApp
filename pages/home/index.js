Page({
  data: {
    searchQuery: "",
    categories: ["景点", "住宿", "餐饮"],
    activeCategory: 0,
    allItems: [
      { id: 1, type: "image", title: "冲虚古观概览", src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", category: "景点" },
      { id: 2, type: "video", title: "飞云峰宣传片", src: "https://www.w3schools.com/html/mov_bbb.mp4", category: "景点" },
      { id: 201, type: "image", title: "山景民宿推荐", src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", category: "住宿" },
      { id: 301, type: "image", title: "白莲湖茶舍特色", src: "https://images.unsplash.com/photo-1556742393-d75f4687eaf4?auto=format&fit=crop&w=1200&q=80", category: "餐饮" }
    ],
    items: []
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
  updateList() {
    const q = (this.data.searchQuery || "").trim().toLowerCase()
    const cat = this.data.categories[this.data.activeCategory]
    let arr = [...this.data.allItems].filter(i => i.category === cat)
    if (q) {
      arr = arr.filter(i => i.title.toLowerCase().includes(q))
    }
    this.setData({ items: arr })
  },
  onCardTap(e) {
    const id = Number(e.currentTarget.dataset.id)
    wx.navigateTo({ url: `/pages/poi/detail?id=${id}` })
  },
})
