Page({
  data: {
    detail: {
      id: 0,
      name: "详情",
      cover: "",
      hours: "09:00-18:00",
      desc: "",
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      fav: false,
      lat: 23.4701,
      lng: 114.2832
    }
  },
  onLoad(query) {
    if (query && query.id) {
      const id = Number(query.id)
      const m = this.mockMap()
      const d = m[id] || {
        id,
        name: "条目详情",
        cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        desc: "这里展示条目的简要介绍。",
        hours: "09:00-18:00",
        lat: 23.4701,
        lng: 114.2832
      }
      this.setData({ detail: { ...this.data.detail, ...d } })
    }
  },
  mockMap() {
    return {
      1: { id: 1, name: "冲虚古观", cover: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", desc: "冲虚古观，道教名观，罗浮山核心景点之一。", hours: "08:30-18:00", lat: 23.2695, lng: 114.1399 },
      2: { id: 2, name: "飞云峰", cover: "https://images.unsplash.com/photo-1505765051416-678bbd8acb6c?auto=format&fit=crop&w=1200&q=80", desc: "飞云峰，登高望远，云海壮观。", hours: "08:30-18:00", lat: 23.2742, lng: 114.1491 },
      101: { id: 101, name: "冲虚古观", cover: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80", desc: "冲虚古观简介。", hours: "09:00-17:30", lat: 23.2695, lng: 114.1399 },
      102: { id: 102, name: "飞云峰", cover: "https://images.unsplash.com/photo-1505765051416-678bbd8acb6c?auto=format&fit=crop&w=800&q=80", desc: "飞云峰简介。", hours: "09:00-17:30", lat: 23.2742, lng: 114.1491 },
      103: { id: 103, name: "洗药泉", cover: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80", desc: "洗药泉简介。", hours: "09:00-17:30", lat: 23.2708, lng: 114.1445 },
      104: { id: 104, name: "白莲湖", cover: "https://images.unsplash.com/photo-1502920917128-1aa500764df8?auto=format&fit=crop&w=800&q=80", desc: "白莲湖简介。", hours: "09:00-17:30", lat: 23.2627, lng: 114.1324 },
      201: { id: 201, name: "农家菜馆", cover: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", desc: "农家菜馆简介，地道家常菜。", hours: "10:00-21:00", lat: 23.4711, lng: 114.2841 },
      202: { id: 202, name: "山景民宿", cover: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80", desc: "山景民宿简介，清新舒适。", hours: "全天营业", lat: 23.2702, lng: 114.1410 },
      203: { id: 203, name: "白莲湖茶舍", cover: "https://images.unsplash.com/photo-1556742393-d75f4687eaf4?auto=format&fit=crop&w=800&q=80", desc: "白莲湖茶舍简介。", hours: "10:00-20:00", lat: 23.2624, lng: 114.1315 },
      204: { id: 204, name: "飞云峰山庄", cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80", desc: "飞云峰山庄简介。", hours: "10:00-22:00", lat: 23.2738, lng: 114.1480 }
    }
  },
  onFav() {
    const d = this.data.detail
    this.setData({ detail: { ...d, fav: !d.fav } })
  },
  onNavigate() {
    const d = this.data.detail
    wx.openLocation({ latitude: d.lat, longitude: d.lng, name: d.name })
  }
})
