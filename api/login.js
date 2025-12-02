import { request } from '../utils/api.js'; 
/**
 * 接口0: 微信静默登录
 * 方法: POST
 * 参数: codeId (微信 wx.login 返回的 code)
 */

/*返回示例
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "f3b8a6f4b8e24c8db7e2c8b4e0a1c9ab"
  }
}
*/
export const wxLoginApi = (code) => {
  return request('/auth/login', 'POST', {
    codeId: code
  });
};
