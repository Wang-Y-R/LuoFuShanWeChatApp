import { request } from "../utils/api";

// 查看个人信息
//
// 返回示例
// {
//   "code": 200,
//   "msg": "success",
//   "data": {
//     "id": 3,
//     "nickname": "小明",
//     "avatarUrl": "https://xxx/avatar.jpg",
//     "points": 120,
//     "weeklyCheckinCount": 5
//   }
// }

export const getUserInfo = async () => {
  return await request('/user/profile', 'GET');
};


// 修改个人信息
//
// 返回示例
// {
//   "code": 200,
//   "msg": "success",
//   "data": {
//     "id": 3,
//     "nickname": "张三",
//     "avatarUrl": "https://xxx/new.jpg"
//   }
// }
export const changeUserInfo = async (nickname, avatarUrl) => {
  return await request('/user/profile/update', 'POST', {
    nickname: nickname,
    avatarUrl: avatarUrl
  });
};

// 获取兑换记录
//
// status	String	是	取值：redeemed / unredeemed（已兑换 / 未兑换）
// current	Integer	否	页码（默认 1）
// size	Integer	否	每页条数（默认 10）
// 返回示例
// {
//   "code": 200,
//   "msg": "success",
//   "data": {
//     "current": 1,
//     "size": 10,
//     "total": 2,
//     "pages": 1,
//     "records": [
//       {
//         "id": 12,
//         "itemName": "纪念胸针",
//         "isRedeemed": false,
//         "placeName": "门店1号",
//         "code": "ABCD1234",
//         "createdAt": "2025-12-10 09:30:00"
//       }
//     ]
//   }
// }

export const getRedeemRecords = (status = 'redeemed', current = 1, size = 10) => {
  return request('/user/redeem/records', 'GET', {
    status,
    current,
    size
  });
};

//  获取兑换商城商品列表
//
// sort	String	否	排序方式 points_desc（积分高到低） / points_asc（积分低到高）
// current	Integer	否	页码（默认 1）
// size	Integer	否	每页条数（默认 10）
//
//   "code": 200,
//   "msg": "success",
//   "data": {
//     "current": 1,
//     "size": 10,
//     "total": 3,
//     "pages": 1,
//     "records": [
//       {
//         "id": 5,
//         "name": "景区VIP门票",
//         "coverImg": "https://xxx/item.jpg",
//         "pointsCost": 200,
//         "createdAt": "2025-12-25 14:00:00"
//       }
//     ]
//   }
// }

export const getRedeemItems = (sort = 'points_desc', current = 1, size = 10) => {
  return request('/mall/item/list', 'GET', {
    sort,
    current,
    size
  });
};

// 个人兑换奖品
//
// itemId	Long	是	要兑换的奖品 ID
//
// {
//   "code": 200,
//   "msg": "success",
//   "data": {
//     "recordId": 19,
//     "itemId": 5,
//     "itemName": "景区VIP门票",
//     "code": "D92F-A2CD-89FE",
//     "isRedeemed": false,
//     "placeName": "门店1号",
//     "createdAt": "2025-11-28 12:00:00"
//   }
// }

export const submitRedeemItem = (itemId) => {
  return request('/mall/item/redeem', 'POST', {
    itemId: itemId
  });
};