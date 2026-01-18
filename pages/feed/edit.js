import { sharePost } from '../../api/checkin.js'
import { uploadFile } from '../../utils/api.js'

Page({
  data: { text: '', images: [], lat: null, lng: null, place: '', locationId: null },
  onLoad(q) {
    const lat = q && q.lat ? Number(q.lat) : null
    const lng = q && q.lng ? Number(q.lng) : null
    const place = q && q.place ? decodeURIComponent(q.place) : ''
    const locationId = q && q.locationId ? Number(q.locationId) : null
    this.setData({ lat, lng, place, locationId })
  },
  onInput(e) {
    this.setData({ text: e.detail.value })
  },

  onLineChange(e) {
    // 文本框高度自适应
  },
  chooseImages() {
    const currentCount = this.data.images.length;
    const maxCount = 9 - currentCount;

    if (maxCount <= 0) {
      wx.showToast({ title: '最多只能选择9张图片', icon: 'none' });
      return;
    }

    wx.chooseImage({
      count: maxCount,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: r => {
        const newImages = [...this.data.images, ...r.tempFilePaths];
        this.setData({ images: newImages });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    });
  },

  // 取消发布
  onCancel() {
    wx.showModal({
      title: '提示',
      content: '确定要放弃发布吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },
  async publish() {
    // 验证内容
    if (!this.data.text.trim() && this.data.images.length === 0) {
      wx.showToast({ title: '请填写内容或选择图片', icon: 'none' })
      return
    }

    if (!this.data.locationId) {
      wx.showToast({ title: '请选择打卡地点', icon: 'none' })
      return
    }

    try {
      wx.showLoading({ title: '发布中...' })

      // 上传图片
      let uploadedImages = []
      if (this.data.images && this.data.images.length > 0) {
        for (const img of this.data.images) {
          try {
            const uploadRes = await uploadFile(img)
            if (uploadRes) {
              uploadedImages.push(uploadRes)
            }
          } catch (error) {
            console.error('图片上传失败:', error)
            wx.showToast({ title: '图片上传失败', icon: 'none' })
          }
        }
      }

      // 调用后端API发布动态
      const result = await sharePost(
        this.data.locationId,
        this.data.text.trim() || '分享了一次打卡',
        uploadedImages,
        new Date().toISOString().slice(0, 19).replace('T', ' ')
      )

      if (result.code === 200) {
        wx.showToast({ title: '发布成功', icon: 'success' })
        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(result.msg || '发布失败')
      }
    } catch (error) {
      console.error('发布失败:', error)
      wx.showToast({ title: error.message || '发布失败，请重试', icon: 'none' })
    } finally {
      // 确保 hideLoading 总是被调用
      try {
        wx.hideLoading()
      } catch (hideError) {
        console.error('hideLoading 失败:', hideError)
      }
    }
  }
})
