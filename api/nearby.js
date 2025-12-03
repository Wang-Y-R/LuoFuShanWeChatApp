import { request } from "../utils/api";

/**
 * 1. 通用查询附近资源
 * 说明：查询用户附近的资源，必须指定类别，支持按距离或热度排序及分页。
 * 方法：GET
 * 路径：/resource/nearby
 * * @param {string} type - (必填) 类别：'景点' / '住宿' / '餐饮' / '商家'
 * @param {number} latitude - (必填) 用户纬度
 * @param {number} longitude - (必填) 用户经度
 * @param {number} page - (可选) 页码，默认 1
 * @param {number} size - (可选) 每页数量，默认 10
 * @param {string} sortBy - (可选) 排序方式：'distance'(距离) / 'hot'(热度)，默认 'distance'
 * * @returns {Promise} 
 * 返回示例:
 * {
 * "code": 200,
 * "msg": "success",
 * "data": {
 * "current": 1,
 * "size": 10,
 * "total": 15,
 * "pages": 2,
 * "records": [
 * {
 * "id": 1,
 * "title": "九寨沟",
 * "distance": 1200,
 * "hotScore": 95,
 * "coverImg": "https://example.com/images/jiuzhaigou.jpg",
 * "createdAt": "2025-11-27 10:00:00"
 * }
 * ]
 * }
 * }
 */
export const getNearbyList = (type, latitude, longitude, page = 1, size = 10, sortBy = 'distance') => {
  return request('/resource/nearby', 'GET', {
    type,
    latitude,
    longitude,
    page,
    size,
    sortBy
  });
};

/**
 * 2. 查看附近资源正文详情
 * 说明：根据资源ID获取正文信息，同时返回距离、热度等元数据。
 * 方法：GET
 * 路径：/resource/nearby/content
 * * @param {number|string} id - (必填) 资源ID
 * @param {number} latitude - (必填) 用户纬度 (用于计算实时距离)
 * @param {number} longitude - (必填) 用户经度 (用于计算实时距离)
 * * @returns {Promise}
 * 返回示例:
 * {
 * "code": 200,
 * "msg": "success",
 * "data": {
 * "id": 1,
 * "name": "九寨沟",
 * "distance": 1200,
 * "hotScore": 95,
 * "coverImg": "https://example.com/images/jiuzhaigou.jpg",
 * "createdAt": "2025-11-27 10:00:00",
 * "content": [
 * { "type": "text", "value": "九寨沟风景区位于..." },
 * { "type": "image", "value": "https://example.com/images/1.jpg" }
 * ]
 * }
 * }
 */
export const getNearbyContent = (id, latitude, longitude) => {
  return request('/resource/nearby/content', 'GET', {
    id,
    latitude,
    longitude
  });
};