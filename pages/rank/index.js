Page({
  data: {
    tabs: ["日", "周", "月"],
    activeTab: 0,
    list: [
      { id: 1, name: "游客A", points: 120, count: 10, rank: 1, avatar: "https://via.placeholder.com/128" },
      { id: 2, name: "游客B", points: 110, count: 9, rank: 2, avatar: "https://via.placeholder.com/128" }
    ]
  },
  onTab(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ activeTab: idx })
  }
})
