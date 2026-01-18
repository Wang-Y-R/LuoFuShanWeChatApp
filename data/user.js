import { getUserInfo} from "../api/profile.js"

// "user": {
//   "id": 1001,
//   "nickname": "小明",
//   "avatar_url": "https://xx.com/avatar.jpg",
//   "points": 120,
//   "weekly_checkin_count": 3
// }


const user = {
  id: 0,
  avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
  nickname: '游客',
  points: 0,
  weeklyCheckinCount: 0,
}

export const getUser = () => {
  const storedUser = wx.getStorageSync('user');
  return storedUser || { ...user };
}

export const setUser = (u) => {
  wx.setStorageSync('user', u)
}

export const clearUser = () => {
  wx.removeStorageSync('user')
}

export const getUserId = () => {
  return getUser().id
}

export const updateUser = async () => {
  try {
    const res = await getUserInfo();
    if (res.code === 200) {
      setUser(res.data);
      return res.data;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}