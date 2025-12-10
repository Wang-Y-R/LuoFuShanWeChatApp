import { request } from '../utils/api.js'; 
/**
 * 接口0: 微信静默登录
 * 方法: POST
 * 参数: codeId,appId,secret
 */

/*返回示例
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "f3b8a6f4b8e24c8db7e2c8b4e0a1c9ab",
    "user": {
      "id": 1001,
      "nickname": "小明",
      "avatar_url": "https://xx.com/avatar.jpg",
      "points": 120,
      "weekly_checkin_count": 3
    }
  }
}
*/
export const wxLoginApi = (codeId, appId, secret) => {
  return request('/auth/login', 'POST', {
    codeId: codeId,
    appId: appId,
    secret: secret
  });
};
