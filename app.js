import { wxLoginApi } from './api/login.js'; 

App({
  onLaunch() {
    this.handleSilentLogin();
    //TODO 这要改为从后端拿取用户信息
    const u = wx.getStorageSync('userInfo') || { avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', nickname: '游客' }
    this.globalData.user = u
    this.globalData.language = 'zh'
  },

  handleSilentLogin: function () {
    // 1. 调用微信官方接口获取临时 code
    wx.login({
      success: async (res) => {
        if (res.code) {
          console.log('微信获取 code 成功:', res.code);
          try {
            // 2. 调用后端接口，用 code 换取 token
            const result = await wxLoginApi(res.code);
            // 3. 根据后端返回的结构处理 (code: 200, data: { token: ... })
            if (result.code === 200 && result.data && result.data.token) {
              const token = result.data.token;
              // 4. 将 token 存入本地缓存
              wx.setStorageSync('token', token);
              console.log('登录成功，Token 已存储:', token);
            } else {
              console.error('登录失败，后端返回异常:', result);
            }
          } catch (error) {
            console.error('登录请求发生错误:', error);
          }
        } else {
          console.error('微信登录失败！' + res.errMsg);
        }
      }
    });
  },

  globalData: { user: null, language: 'zh', mapKey: 'G42BZ-6LWLT-JVXXV-LQWMS-JCD2H-JCFJM', loginCode: '' }
})
