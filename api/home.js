import { request } from "../utils/api";
/**
 * 接口0: 通用资源查询 (景点/住宿/餐饮/商家)
 * 方法: GET
 * 参数: 
 * - type: 类别 (默认 'ALL', 可选 '景点', '住宿', '餐饮', '商家')
 * - fuzzy: 模糊搜索词 (默认 '')
 * - page: 页码 (默认 1)
 * - size: 每页数量 (默认 10)
 */

/*
返回示例
{
    "code": 200,
    "msg": "success",
    "data": {
        "records": [
            {
                "id": 2,
                "type": "住宿",
                "name": "成都锦江宾馆",
                "coverImg": "https://example.com/images/jinjiang_hotel.jpg",
                "latitude": 30.6586,
                "longitude": 104.0648,
                "hotScore": 80
            },
            {
                "id": 3,
                "type": "餐饮",
                "name": "成都火锅店",
                "coverImg": "https://example.com/images/hotpot.jpg",
                "latitude": 30.6628,
                "longitude": 104.0719,
                "hotScore": 75
            }
        ],
        "total": 3,
        "size": 2,
        "current": 1,
        "pages": 2
    }
}
*/
export const getResourceList = (type = 'ALL', fuzzy = '', page = 1, size = 10) => {
  return request('/resource/list', 'GET', {
    type: type,
    fuzzy: fuzzy,
    page: page,
    size: size
  });
};


/**
 * 接口1: 查看资源正文内容
 * 方法: GET
 * 参数: id (资源ID)
 * 说明: 返回的数据 data 是组件化的 JSON 字符串
 */

/*返回示例
{
  "code": 200,
  "msg": "success",
  "data": "{...content_json...}"
}
*/
export const getResourceContent = (id) => {
  return request('/resource/content', 'GET', {
    id: id
  });
};
