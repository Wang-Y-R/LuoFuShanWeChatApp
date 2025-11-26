App({
  onLaunch() {
    doLogin()
    const u = wx.getStorageSync('userInfo') || { avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', nickname: '游客' }
    this.globalData.user = u
    this.globalData.language = 'zh'
  },
  doLogin: function () {
  return new Promise((resolve, reject) => {
    // 1. 检查本地是否有 Token 且未过期（可选优化，这里为了演示简化，每次都重新登录）
    // const token = wx.getStorageSync('token');
    // if (token) { resolve(token); return; }
    // 2. 调用微信登录接口
    wx.login({
      success: res => {
        this.globalData.loginCode = res.code
        if (res.code) {
          console.log('获取到微信Code:', res.code);
          
          // TODO 发送 code 给后端，获取token，用户信息等
          // wx.request({
          //   url: 'http://localhost:8080/api/auth/login', // 后端接口
          //   method: 'POST',
          //   data: { code: res.code }, 
          //   success: (response) => {
          //     if (response.data.success) { // 假设后端返回结构是 Result<T>
          //       const token = response.data.data.token;
                
          //       //Storage
          //       wx.setStorageSync('token', token);
          //       console.log('Token已获取并存储:', token);
          //       resolve(token);
          //     } else {
          //       console.error('后端登录失败:', response.data.message);
          //       reject(response.data.message);
          //     }
          //   },
          //   fail: (err) => {
          //     console.error('请求后端失败:', err);
          //     reject(err);
          //   }
          // })
        } else {
          reject('微信登录失败：' + res.errMsg);
        }
      }
    })
    })
  },
  globalData: { user: null, language: 'zh', mapKey: 'G42BZ-6LWLT-JVXXV-LQWMS-JCD2H-JCFJM', loginCode: '' }
})
