Page({
  data: {
    user: { avatar: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0", nickname: "游客", points: 0, level: 1 }
  },
  onLoad() {
    const u = wx.getStorageSync('userInfo')
    if (u) {
      this.setData({ user: { ...this.data.user, avatar: u.avatar, nickname: u.nickname } })
    }
  },
  onShow() {
    const u = wx.getStorageSync('userInfo')
    if (u) this.setData({ user: { ...this.data.user, avatar: u.avatar, nickname: u.nickname } })
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 })
    }
  },
  onCall() {
    wx.makePhoneCall({ phoneNumber: "4000000000" })
  },
  goCheckins() {
    wx.navigateTo({ url: '/pages/checkins/index' })
  },
  goRedeems() {
    wx.navigateTo({ url: '/pages/redeems/index' })
  },
  goGifts() {
    wx.navigateTo({ url: '/pages/gifts/index' })
  },
  goEdit() {
    wx.navigateTo({ url: '/pages/profile/edit' })
  }
})
