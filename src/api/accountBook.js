import request from '@/utils/request'

export function addRecords(data) {
  return request({
    url: '/accountBook/addRecords',
    method: 'post',
    data
  })
}
export function getRecords(data) {
  return request({
    url: '/accountBook/getRecords',
    method: 'get',
    params: data
  })
}
export function getStatistics(data) {
  return request({
    url: '/accountBook/getStatistics',
    method: 'get',
    params: data
  })
}

export function updateRecord(data) {
  return request({
    url: '/accountBook/updateRecord',
    method: 'post',
    data
  })
}

// 分类相关接口
export function getCategoryTree() {
  return request({
    url: '/accountBook/getCategoryTree',
    method: 'get'
  })
}

export function addCategory(data) {
  return request({
    url: '/accountBook/addCategory',
    method: 'post',
    data
  })
}
