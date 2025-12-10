import { request } from '../utils/api.js'; 
import { getUserId } from '../data/user.js';

/**
 * 接口1: 获取所有打卡点信息
 * 方法: GET
 * 说明: 获取列表（地名、经纬度、积分、今日打卡总数）
 */
/*返回示例
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "九寨沟",
      "latitude": 33.2529,
      "longitude": 103.9186,
      "score": 10,
      "todayHasCheckin": 25
    },
    {
      "id": 2,
      "name": "成都锦江宾馆",
      "latitude": 30.6586,
      "longitude": 104.0648,
      "score": 5,
      "todayHasCheckin": 18
    }
  ]
}
*/
export const getCheckinLocations = () => {
  return request('/checkin/location/list', 'GET');
};



/**
 * 接口2: 查看打卡历史记录
 * 方法: GET
 * 参数: page (选填), size (选填)
 */
/*
{
  "code": 200,
  "msg": "success",
  "data": {
    "current": 1,
    "size": 10,
    "total": 3,
    "pages": 1,
    "records": [
      {
        "id": 1,
        "locationName": "九寨沟",
        "checkinTime": "2025-11-27 10:00:00",
        "score": 10
      },
      {
        "id: 2,
        "locationName": "成都锦江宾馆",
        "checkinTime": "2025-11-26 15:30:00",
        "score": 5
      }
    ]
  }
}
*/
export const getCheckinHistory = (page = 1, size = 10) => {
  return request('/checkin/user/history', 'GET', {
    page: page,
    size: size
  });
};

/**
 * 接口3: 用户打卡
 * 方法: POST
 * 参数: userId, locationId, checkinTime
 * 说明: 前端需自行校验重复打卡，传递时间格式建议为 "yyyy-MM-dd HH:mm:ss"
 */
/*
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 123,
    "locationId": 1,
    "locationName": "九寨沟",
    "checkinTime": "2025-11-27 10:00:00",
    "score": 10,
    "todayHasCheckin": 26
  }
}
*/
export const submitCheckin = ( id, checkinTime) => {
  return request('/checkin/user', 'POST', {
    id: id,
    checkinTime: checkinTime
  });
};

/**
 * 接口4: 分享动态
 * 方法: POST
 * 参数: {locationId, content, images(Array), postTime }
 * 说明: images 为图片链接数组
 */
/*
{
  "code": 200,
  "msg": "success",
  "data": {
    "postId": 456,
    "userId": 1,
    "locationId": 1,
    "content": "今天在九寨沟玩得很开心！",
    "images": [
      "https://example.com/images/1.jpg",
      "https://example.com/images/2.jpg"
    ],
    "likeCount": 0,
    "commentCount": 0,
    "postTime": "2025-11-27 10:15:00"
  }
}
*/
export const submitSharePost = (locationId, content, images, postTime) => {
  // data 结构示例:
  // {
  //   userId: 1,
  //   locationId: 2,
  //   content: "文本内容",
  //   images: ["url1", "url2"],
  //   postTime: "2025-11-27 10:15:00"
  // }
  return request('/post/user/share', 'POST', {
    locationId: locationId,
    content: content,
    images: images,
    postTime: postTime
  });
};


