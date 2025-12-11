import { changeUserInfo } from "../../api/profile.js"
import { getUser,updateUser } from "../../data/user.js"

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
async onSave() {
  // 1. 开启 Loading，防止用户重复点击
  wx.showLoading({ title: '保存中...' })

  try {
    await changeUserInfo(this.data.nickname || '游客', this.data.avatarUrl)
    updateUser()
    // 隐藏 Loading
    wx.hideLoading()
    wx.showToast({ title: '已保存', icon: 'success', duration: 1500 })
    setTimeout(() => {
      wx.navigateBack()
    }, 1500) // 这里的时间最好和 showToast 的 duration 一致

  } catch (err) {
    // 如果出错（比如断网），不要返回上一页，而是报错
    wx.hideLoading()
    console.error(err)
    wx.showToast({ title: '保存失败', icon: 'none' })
  }
}
})
