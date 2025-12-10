import { request } from '../utils/api.js';

/**
 * 1. 查询动态列表
 * 说明：查询动态列表，支持按用户位置筛选距离、按时间/点赞/评论排序、分页查询及模糊搜索。
 * 方法：GET
 * 路径：/post/list
 * * @param {string} fuzzy - (可选) 模糊搜索内容，默认 ''
 * @param {number|null} latitude - (可选) 用户纬度 (按距离排序时必填)
 * @param {number|null} longitude - (可选) 用户经度 (按距离排序时必填)
 * @param {number} page - (可选) 页码，默认 1
 * @param {number} size - (可选) 每页数量，默认 10
 * @param {string} sortBy - (可选) 排序方式：'time'(时间), 'distance'(距离), 'like'(点赞), 'comment'(评论)。默认 'time'
 * * @returns {Promise}
 * 返回示例:
 * {
 * "code": 200,
 * "msg": "success",
 * "data": {
 * "records": [
 * {
 * "id": 2,
 * "title": "aliquip ea in sit consequat",
 * "locationName": "乐山大佛",
 * "images": ["https://loremflickr.com/400/400..."],
 * "latitude": 29.5585,
 * "longitude": 103.7655,
 * "distance": 54057.95,
 * "likeCount": 1,
 * "commentCount": 0,
 * "postTime": "2025-11-28T11:56:11"
 * }
 * ],
 * "total": 5,
 * "size": 10,
 * "current": 1,
 * "pages": 1
 * }
 * }
 */
export const getFeedList = (fuzzy = '', latitude = null, longitude = null, page = 1, size = 10, sortBy = 'time') => {
  const data = {
    fuzzy,
    page,
    size,
    sortBy
  };
  // 只有当经纬度存在时才放入参数中
  if (latitude !== null) data.latitude = latitude;
  if (longitude !== null) data.longitude = longitude;

  return request('/post/list', 'GET', data);
};

/**
 * 2. 查询评论列表
 * 说明：获取某条动态的评论列表，按时间顺序返回。
 * 方法：GET
 * 路径：/post/comments
 * * @param {number|string} postId - (必填) 动态ID
 * @param {number} page - (可选) 页码，默认 1
 * @param {number} size - (可选) 每页数量，默认 10
 * * @returns {Promise}
 * 返回示例:
 * {
 * "code": 200,
 * "msg": "success",
 * "data": {
 * "current": 1,
 * "size": 10,
 * "total": 5,
 * "pages": 1,
 * "records": [
 * {
 * "commentId": 201,
 * "userId": 1,
 * "nickname": "小明",
 * "avatarUrl": "https://example.com/avatar.jpg",
 * "content": "太美了！",
 * "createdAt": "2025-11-27 11:00:00"
 * }
 * ]
 * }
 * }
 */
export const getPostComments = (postId, page = 1, size = 10) => {
  return request('/post/comments', 'GET', {
    postId,
    page,
    size
  });
};

/**
 * 3. 用户发送评论
 * 说明：用户对某条动态发表评论。
 * 方法：POST
 * 路径：/post/comment
 * * @param {number|string} postId - (必填) 动态ID
 * @param {string} content - (必填) 评论内容
 * * @returns {Promise}
 * 返回示例:
 * {
 * "code": 200,
 * "msg": "success",
 * "data": {
 * "id": 203,
 * "postId": 101,
 * "userId": 1,
 * "content": "好美的景色！",
 * "createdAt": "2025-11-28 09:55:00"
 * }
 * }
 */
export const sendPostComment = (postId, content) => {
  return request('/post/comment', 'POST', {
    postId,
    userId,
    content
  });
};