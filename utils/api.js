// =========================================================================
// 1. 基础配置
// =========================================================================

// 请将此处替换为你实际的后端服务器域名
const BASE_URL = 'https://你的域名.com'; 

// =========================================================================
// 2. 网络请求封装 (Promise)
// =========================================================================

/**
 * 统一请求函数
 * @param {string} url - 接口路径 (例如 /checkin/location/list)
 * @param {string} method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {object} data - 请求参数
 */
export const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    // 1. 获取本地存储的 token
    const token = wx.getStorageSync('token');

    // 2. 构造请求头
    const header = {
      'content-type': 'application/json', // 默认 JSON 格式
    };

    // 3. 如果有 token，自动添加到 Header 中
    // 注意：具体 Key 是 'token' 还是 'Authorization' 需根据后端要求微调
    // 这里假设标准做法：Authorization: token
    if (token) {
      header['Authorization'] = token; 
      // header['token'] = token; // 如果后端要求 key 叫 token，用这行
    }

    // 4. 发起请求
    wx.request({
      url: `${BASE_URL}${url}`,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        // 5. 统一处理响应
        // 假设后端返回 code: 200 代表成功
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data); // 返回成功的数据包
        } else if (res.data.code === 401) {
          // 处理 Token 过期的情况
          wx.removeStorageSync('token');
          wx.showToast({ title: '登录失效，请重新登录', icon: 'none' });
          // 这里可以跳转回登录页或触发重新登录逻辑
          reject(res.data);
          console.log('Token 过期，已清除本地存储');
        } else {
          // 其他业务错误
          wx.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
          reject(res.data);
          console.log(url,'业务错误:', res.data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络连接异常', icon: 'none' });
        reject(err);
        console.log(url,'网络错误:', err);
      }
    });
  });
};
