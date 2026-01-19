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
      
      // 显示加载中
      wx.showLoading({ title: '加载中...' })
      
      if (lat && lng) {
        this.loadNearbyDetail(id, lat, lng)
      } else {
        wx.getLocation({
          type: 'gcj02',
          success: r => this.loadNearbyDetail(id, r.latitude, r.longitude),
          fail: () => {
            wx.hideLoading()
            this.loadNearbyDetail(id, null, null)
          }
        })
      }
    } else {
      wx.showToast({ title: '缺少参数', icon: 'none' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },
  
  async loadNearbyDetail(id, lat, lng) {
    try {
      const res = await getNearbyContent(id, lat, lng)
      const d = res && res.data ? res.data : {}
      
      console.log('详情数据:', d) // 调试用
      
      let sections = []
      
      // 解析content字段 - 根据你提供的后端格式
      if (d.content) {
        try {
          // 后端返回的content是JSON字符串
          if (typeof d.content === 'string') {
            // 解析JSON字符串
            const contentArray = JSON.parse(d.content)
            
            if (Array.isArray(contentArray)) {
              sections = contentArray
                .filter(item => item && (item.type === 'text' || item.type === 'image'))
                .map(item => {
                  // 使用value字段
                  return {
                    type: item.type,
                    value: item.value || ''
                  }
                })
            }
          } else if (Array.isArray(d.content)) {
            // 如果后端直接返回数组
            sections = d.content
              .filter(item => item && (item.type === 'text' || item.type === 'image'))
              .map(item => ({
                type: item.type,
                value: item.value || item.content || ''
              }))
          }
        } catch (parseError) {
          console.error('解析content失败:', parseError, 'content:', d.content)
          
          // 如果解析失败，尝试直接当作纯文本处理
          if (typeof d.content === 'string') {
            sections = [{
              type: 'text',
              value: d.content
            }]
          }
        }
      }
      
      // 构建详情对象 - 保持与wxml一致的字段名
      const detail = {
        id: d.id || id,
        name: d.name || '详情',
        cover: d.coverImg || '',
        hours: this.data.detail.hours, // 保持默认营业时间
        desc: '', // wxml中未使用，但保持原有结构
        video: this.data.detail.video, // wxml中未使用，但保持原有结构
        lat: d.latitude || d.lat || lat || this.data.detail.lat,
        lng: d.longitude || d.lng || lng || this.data.detail.lng,
        sections: sections
      }
      
      this.setData({ detail }, () => {
        wx.hideLoading()
      })
      
    } catch (e) {
      console.error('加载详情失败:', e)
      wx.hideLoading()
      wx.showToast({ 
        title: '加载失败', 
        icon: 'none',
        duration: 2000
      })
      
      // 设置默认详情数据
      const detail = { 
        ...this.data.detail, 
        id: id,
        lat: lat || this.data.detail.lat, 
        lng: lng || this.data.detail.lng, 
        sections: [] 
      }
      this.setData({ detail })
    }
  },
  
  onNavigate() {
    const d = this.data.detail
    if (d.lat && d.lng) {
      wx.openLocation({ 
        latitude: d.lat, 
        longitude: d.lng, 
        name: d.name || '目的地',
        scale: 15
      })
    } else {
      wx.showToast({ 
        title: '缺少位置信息', 
        icon: 'none',
        duration: 2000
      })
    }
  },
})