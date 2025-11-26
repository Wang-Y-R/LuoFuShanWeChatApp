Component({
  data: {
    selected: 0,
    list: [
      { pagePath: "/pages/home/index", text: "首页", icon: "🏠" },
      { pagePath: "/pages/check/index", text: "打卡", icon: "📍" },
      { pagePath: "/pages/nearby/index", text: "附近", icon: "🧭" },
      { pagePath: "/pages/feed/index", text: "动态", icon: "💬" },
      { pagePath: "/pages/profile/index", text: "我的", icon: "👤" }
    ]
  },
  methods: {
    onSwitch(e) {
      const idx = Number(e.currentTarget.dataset.index)
      const item = this.data.list[idx]
      wx.switchTab({ url: item.pagePath })
    },
  }
})
