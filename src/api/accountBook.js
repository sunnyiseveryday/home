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
