Page({
  data: { list: [] },
  onShow() {
    const list = wx.getStorageSync('redeems') || []
    this.setData({ list })
  }
})
