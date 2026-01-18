import { changeUserInfo } from "../../api/profile.js"
import { getUser,updateUser } from "../../data/user.js"
import { uploadFile } from "../../utils/api.js"

Page({
  data: {
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    nickname: '游客',
    avatarTempPath: ''
  },
  onLoad() {
    const user = getUser()
    if (user) {
      this.setData({ avatarUrl: user.avatar || this.data.defaultAvatarUrl, nickname: user.nickname || '游客' })
    }
  },
  onChooseAvatar(e) {
    const avatarUrl = e.detail && e.detail.avatarUrl
    if (avatarUrl) this.setData({ avatarUrl, avatarTempPath: avatarUrl })
  },
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },
  async onSave() {
    wx.showLoading({ title: '保存中...' })
    try {
      console.log(this.data.avatarTempPath)
      let avatarUrl = this.data.avatarUrl
      if (this.data.avatarTempPath) {
        avatarUrl = await uploadFile(this.data.avatarTempPath)
      }
      await changeUserInfo(this.data.nickname || '游客', avatarUrl)
      await updateUser()
      wx.hideLoading()
      wx.showToast({ title: '已保存', icon: 'success', duration: 1500 })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      wx.hideLoading()
      console.error(err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})
