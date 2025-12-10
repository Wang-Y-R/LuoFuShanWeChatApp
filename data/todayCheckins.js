import { formatDate } from '../utils/date.js'
//示例数据
// const todayCheckins = [
//   {
//     "id": 1,
//     "locationName": "九寨沟",
//     "checkinTime": "2025-11-27"
//  },
//  {
//     "id": 2,
//     "locationName": "九寨",
//     "checkinTime": "2025-11-27",
//   },
// ]

export function todayHasCheckedIn(id) {  
    const checkins = getTodayCheckins()
    if (!checkins) {
        return false
    }
    //清理过期数据
    if (checkins.length > 0) {
        const today = formatDate(new Date())
        if (checkins[0].checkinTime.split(' ')[0] !== today) {
            clearTodayCheckins()
            console.log('清理过期今日打卡数据')
            return false
        }
    }
    return checkins.some(checkin => checkin.id === id)
}

export function addTodayCheckin(checkin) {
  const checkins = getTodayCheckins() || []
  if (todayHasCheckedIn(checkin.id)) {
    return
  }
  checkins.push(checkin)
  setTodayCheckins(checkins)
}

export const getTodayCheckins = () => {
  return wx.getStorageSync('todayCheckins')
}

export const setTodayCheckins = (checkins) => {
  wx.setStorageSync('todayCheckins', checkins)
}

export const clearTodayCheckins = () => {
  wx.removeStorageSync('todayCheckins')
}