Page({
  data: {
    heroImg: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    tabs: [
      "景区概况",
      "白莲湖",
      "梅山别梦",
      "会仙桥",
      "冲虚古观",
      "洗药池",
      "东坡亭",
      "稚川丹灶",
      "青菱园",
      "飞来石",
      "遗履轩"
    ],
    activeTab: 0,
    // 为每个tab 提供前端写死的内容
    pages: [],
    currentPage: { title: "", content: "" }
  },
  onLoad() {
    // 构造每个tab的静态内容（前端写死）
    const pages = this.data.tabs.map((t, i) => {
      return {
        title: t,
        content:
          t +
          " — 本节为前端示例内容，展示景区的介绍与特色。此处为演示用途，真实内容应由后端或产品提供并替换。"
      };
    });
    this.setData({ pages, currentPage: pages[this.data.activeTab] || { title: "", content: "" } });
  },
  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    // 将标题放到小程序原生导航栏
    wx.setNavigationBarTitle({ title: "景区概览" });
    // 设置导航栏背景色以匹配之前的样式
    try {
      wx.setNavigationBarColor({
        frontColor: "#ffffff",
        backgroundColor: "#c9a86b"
      });
    } catch (e) {
      // 某些IDE环境可能不支持此API，忽略错误
      console.warn("setNavigationBarColor failed", e);
    }
  },
  onSelectTab(e) {
    const idx = Number(e.currentTarget.dataset.index);
    this.setData({ activeTab: idx, currentPage: this.data.pages[idx] || { title: "", content: "" } });
  },
  // no extra methods
});


