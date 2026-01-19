Page({
  data: {
    heroImg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80", // 默认图片：罗浮山全景
    tabs: [
      "景区概况",
      "白莲湖",
      "梅山别梦",
      "会仙桥",
      "冲虚古观",
      "洗药池",
      "东坡亭",
      "稚川丹灶",
      "飞来石",
      "遗履轩"
    ],
    activeTab: 0,
    // 为每个tab 提供前端写死的内容
    pages: [],
    currentPage: { title: "", content: "", img: "" }
  },
  onLoad() {
    // 为每个 tab 提供人工撰写的介绍内容（前端静态）
    const pages = [
      {
        title: "景区概况",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/bd811277c4a144108e6c559265a1aadf.png", // 罗浮山全景
        content:
          "罗浮山地处岭南，素有\"岭东名山\"之誉。山体以花岗岩为主，植被丰富，溪流、古道与宗教遗迹分布其间，既有自然景观也有人文沉淀。\n\n" +
          "本区适合半日或一日徒步线路，推荐清晨或傍晚前往以避开正午的强光。行程安排建议以\"近览点+主峰\"组合方式进行，途中可沿着古道与溪畔停留，体验当地的山林宁静。\n\n" +
          "注意事项：山路多为石阶与土路，雨天路滑请穿防滑鞋；景区内有部分香火活动场所，请尊重当地习俗并保持安静。"
      },
      {
        title: "白莲湖",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/5aaf18df8e8f4dbaa3d4b60c2ec48da4.png", // 湖泊莲花景观
        content:
          "白莲湖是一处低海拔湖泊，湖面开阔，夏季莲花盛开，倒映周围青山，是拍照与写生的热门地段。\n\n" +
          "湖边步道平坦，适合家庭散步与晨练；清晨的薄雾与倒影构成了非常宜人的景致，摄影爱好者可在日出前后捕捉最佳光线。\n\n" +
          "环保提示：湖区为生态敏感区，请不要跨入莲藕区或投喂水禽，保持环境清洁。"
      },
      {
        title: "梅山别梦",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/b58cf0f3764f4d1d918b31a104d738b4.png", // 梅花园林景观
        content:
          "梅山别梦以四季梅花与古亭为核心景观，冬春之交梅花烂漫，空气中常带有淡淡香气，适合文人雅集与慢游。\n\n" +
          "园内有多处观景平台与石阶，游客可循着步道慢行，沿途会看到传统题词与小型展板，介绍园林的历史与植物配置。\n\n" +
          "建议带上速写本或相机，留意园中标识，尊重植被与文物保护。"
      },
      {
        title: "会仙桥",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/6fec9d39dc1e4eeda22a33f31a87f99b.png", // 古桥山涧景观
        content:
          "会仙桥为古桥样式，横跨清澈山涧，桥上视野开阔，可远眺两岸的植被变化与溪流纹理。桥附近常有当地老者或讲解牌传述桥梁的历史与民间传说。\n\n" +
          "游客可在桥上短暂停留拍照，但请注意人流安全，避免在桥面拥挤滞留。桥下溪水常见小型水生生物，适合开展自然观察。"
      },
      {
        title: "冲虚古观",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/e695ed45f261422685bbd18b6dbc86ae.png", // 道教庙宇景观-冲虚古观实景
        content:
          "冲虚古观为道教庙宇群，殿宇布局庄重，匾额与梁柱雕刻展现出传统工艺之美。庙内香火常年不断，既是宗教活动场所也是重要的文化遗存。\n\n" +
          "参观时请保持肃静，尊重信众的礼仪；如遇到宗教活动正在进行，请不要打扰并尽量在外围观赏。"
      },
      {
        title: "洗药池",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/f0a68b21ddfa4b5fb9a9e8d437c5e3ac.png", // 山间水池景观
        content:
          "洗药池古时为疗愈与道士炼制药材之地，池水清浅，周围植被形成天然的绿荫带。此处在民间传说中常与古医术或长者故事相连。\n\n" +
          "池边环境较为湿滑，请勿靠近池边戏水或取水饮用；拍照与观察时请注意脚下安全。"
      },
      {
        title: "东坡亭",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/e0e00b8a1e3544dba6c4cbfa5030a55d.png", // 古亭景观
        content:
          "东坡亭为纪念苏轼等文化名人而建，亭台位置通常选在观景佳处，能俯瞰山谷与远景，是读书、写诗与休憩的理想点。\n\n" +
          "亭内外石刻与碑词记录了历史典故，文化爱好者可沿着提示牌了解相关背景故事。傍晚登亭，往往能看见渐变的天空与层叠山色。"
      },
      {
        title: "稚川丹灶",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/a129288dfaf7492a8d562c9ad02855a8.png", // 山石景观
        content:
          "稚川丹灶为古代工匠与村落活动的遗迹地，周边岩石风貌独特，流水穿石的景观别具一格。这里也反映了古时人们与自然共处的生活方式。\n\n" +
          "走访时请遵循步道，不攀爬脆弱的岩体，并尊重当地的历史口述与保护标志。"
      },
      {
        title: "飞来石",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/d7ba188d3210472b9ad7073d6e2c4741.png", // 巨石山景
        content:
          "飞来石以其独特的地质形态和壮观的观景位置著称，是拍摄日出与云海的热门点之一。早晨的云雾与阳光交织，常能形成漂亮的自然光影效果。\n\n" +
          "登石台请沿护栏行进，注意天气变化与防滑；摄影设备请稳固放置，注意周围游客安全。"
      },
      {
        title: "遗履轩",
        img: "https://www.picarran.xyz:8002/uploads/image/2026/01/19/b9f5f085eccc4fc089c31eeafa1e2133.png", // 古典建筑景观
        content:
          "遗履轩为一处文化小筑，常用于举办诗会、讲座与展览，内部有若干碑刻与展陈，展现本地文人雅事与历史片段。\n\n" +
          "此处氛围宁静，适合停歇阅读或参加小型文化活动；参观时请保持场所整洁，遵守展览规则。"
      }
    ];

    this.setData({
      pages,
      currentPage: pages[this.data.activeTab] || { title: "", content: "", img: "" },
      heroImg: pages[this.data.activeTab].img || this.data.heroImg
    });
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
    const currentPage = this.data.pages[idx] || { title: "", content: "", img: "" };
    this.setData({
      activeTab: idx,
      currentPage: currentPage,
      heroImg: currentPage.img || this.data.heroImg
    });
  },
  // no extra methods
});


