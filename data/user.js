import { getUserInfo} from "../api/profile.js"

// "user": {
//   "id": 1001,
//   "nickname": "小明",
//   "avatar_url": "https://xx.com/avatar.jpg",
//   "points": 120,
//   "weekly_checkin_count": 3
// }


const user = {
  id:  0,
  avatarUrl: '',
  nickname: '',
  points: 0,
  weeklyCheckinCount: 0,
}

export const getUser = () => {
  return wx.getStorageSync('user')
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

export const updateUser = () => {
  getUserInfo().then(res => {
    if (res.code === 200) {
      setUser(res.data)
    }
  })
}