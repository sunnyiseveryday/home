import request from '@/utils/request'

export function addRecords(data) {
  return request({
    url: '/accountBook/addRecords',
    method: 'post',
    data
  })
}
