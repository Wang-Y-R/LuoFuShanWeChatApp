import { wxLoginApi } from './api/login.js'; 
import { appId, secret } from './config/loginConfig.js';
import { setUser } from './data/user.js';
App({
  onLaunch() {
    this.handleSilentLogin();
    //TODO 这要改为从后端拿取用户信息
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
            console.log('调用后端接口，用 code 换取 token');
            console.log(appId, secret);
            const result = await wxLoginApi(res.code, appId, secret);
            // 3. 根据后端返回的结构处理 (code: 200, data: { token: ... })
            if (result.code === 200 && result.data && result.data.token) {
              const token = result.data.token; 
              const user = {
                id: result.data.id || 0,
                avatarUrl: result.data.avatarUrl || '',
                nickname: result.data.nickname || '',
                points: result.data.points || 0,
                weeklyCheckinCount: result.data.weeklyCheckinCount || 0,
              }
              // 4. 将 token 存入本地缓存
              wx.setStorageSync('token', token);
              setUser(user);
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

  globalData: { language: 'zh', mapKey: 'G42BZ-6LWLT-JVXXV-LQWMS-JCD2H-JCFJM', loginCode: '' }
})
