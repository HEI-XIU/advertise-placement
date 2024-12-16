import request from '@/utils/request'
// import { praseStrEmpty } from "@/utils/admin";
import axios from 'axios'
// import {getTenantId } from '@/utils/auth'

// 文件上传
export function uploadFile (formData) {
    // return axios.request({
    return request({
      headers: { 'Content-Type': 'multipart/form-data' },
      // url: process.env.VUE_APP_BASE_API + '/upload/uploadFile',
      url: '/upload/uploadFile',
      method: 'post',
      data: formData
    })
  }

  export function downloadFile (data) {
    return request({
        responseType: 'blob',
        url: data,
        method: 'post',
    })
}

    //发起订单申请提交
export function submitTab(data) {
    return request({
      url: '/dev-api/advertOrder/saveOrUpdateOrder',
      method: 'post',
      data: data
    })
  }
