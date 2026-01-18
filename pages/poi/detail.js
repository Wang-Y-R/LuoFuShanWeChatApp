import { getNearbyContent } from "../../api/nearby.js";

Page({
  data: {
    detail: {
      id: 0,
      name: "详情",
      cover: "",
      hours: "09:00-18:00",
      desc: "",
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      lat: 23.4701,
      lng: 114.2832,
      sections: []
    }
  },
  onLoad(query) {
    if (query && query.id) {
      const id = Number(query.id)
      const lat = query.lat ? Number(query.lat) : null
      const lng = query.lng ? Number(query.lng) : null
      if (lat && lng) {
        this.loadNearbyDetail(id, lat, lng)
      } else {
        wx.getLocation({
          type: 'gcj02',
          success: r => this.loadNearbyDetail(id, r.latitude, r.longitude),
          fail: () => this.loadNearbyDetail(id, null, null)
        })
      }
    }
  },
  async loadNearbyDetail(id, lat, lng) {
    try {
      const res = await getNearbyContent(id, lat, lng)
      const d = res && res.data ? res.data : {}
      let raw = []
      if (Array.isArray(d.content)) {
        raw = d.content
      } else if (typeof d.content === 'string') {
        try { const parsed = JSON.parse(d.content); if (Array.isArray(parsed)) raw = parsed } catch (_) { }
      }
      const sections = raw
        .filter(i => i && (i.type === 'text' || i.type === 'image') && (i.value || i.content))
        .map(i => ({ type: i.type, value: i.value || i.content }))
      const detail = {
        id: d.id || id,
        name: d.name || '详情',
        cover: d.coverImg || '',
        hours: this.data.detail.hours,
        desc: '',
        video: this.data.detail.video,
        lat: d.latitude || d.lat || lat || this.data.detail.lat,
        lng: d.longitude || d.lng || lng || this.data.detail.lng,
        sections
      }
      this.setData({ detail })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      const detail = { ...this.data.detail, id, lat: lat || this.data.detail.lat, lng: lng || this.data.detail.lng, sections: [] }
      this.setData({ detail })
    }
  },
  onNavigate() {
    const d = this.data.detail
    if (d.lat && d.lng) {
      wx.openLocation({ latitude: d.lat, longitude: d.lng, name: d.name })
    } else {
      wx.showToast({ title: '缺少定位坐标', icon: 'none' })
    }
  }
})
