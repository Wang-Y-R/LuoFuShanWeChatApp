import { changeUserInfo } from "../../api/profile.js"
import { getUser } from "../../data/user.js"

Page({
  data: {
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    nickname: '游客'
  },
  onLoad() {
    const user = getUser()
    if (user) {
      this.setData({ avatarUrl: user.avatar || this.data.defaultAvatarUrl, nickname: user.nickname || '游客' })
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
    changeUserInfo({ nickname: this.data.nickname || '游客' ,avatar: this.data.avatarUrl, })
    wx.showToast({ title: '已保存', icon: 'success' })
    wx.navigateBack()
  }
})
