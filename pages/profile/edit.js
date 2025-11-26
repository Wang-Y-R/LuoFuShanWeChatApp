Page({
  data: {
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    nickname: '游客'
  },
  onLoad() {
    const u = wx.getStorageSync('userInfo')
    if (u) {
      this.setData({ avatarUrl: u.avatar || this.data.defaultAvatarUrl, nickname: u.nickname || '游客' })
    }
  },
  onChooseAvatar(e) {
    const avatarUrl = e.detail && e.detail.avatarUrl
    if (avatarUrl) this.setData({ avatarUrl })
  },
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },
  onSave() {
    const user = { avatar: this.data.avatarUrl, nickname: this.data.nickname || '游客' }
    wx.setStorageSync('userInfo', user)
    const app = getApp()
    if (app && app.globalData) app.globalData.user = user
    wx.showToast({ title: '已保存', icon: 'success' })
    //todo 调用后端更新用户信息
    wx.navigateBack()
  }
})
