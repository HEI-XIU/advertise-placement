import request from '@/utils/request'
// import { praseStrEmpty } from "@/utils/admin";
import axios from 'axios'
// import {getTenantId } from '@/utils/auth'

// 文件上传
export function uploadFile(formData) {
  // return axios.request({
  return request({
    headers: { 'Content-Type': 'multipart/form-data' },
    // url: process.env.VUE_APP_BASE_API + '/upload/uploadFile',
    url: '/upload/uploadFile',
    method: 'post',
    data: formData
  })
}

export function downloadFile(data) {
  return request({
    responseType: 'blob',
    url: data,
    method: 'post',
  })
}

//保存订单提交申请
export function saveorderTab(data) {
  return request({
    url: '/advertOrder/saveOrUpdateOrder',
    method: 'post',
    data: data
  })
}

//发起订单申请提交
export function submitorderTab(data) {
  return request({
    url: '/advertOrder/submit',
    method: 'post',
    data: data
  })
}

//获取当前用户信息
export function getuserinfo() {
  return request({
    url: '/getInfo',
    method: 'get',
  })
}

//获取广告列表
export function getorderList(params) {
  return request({
    url: '/advertOrder/list',
    method: 'post',
    data: params
  })
}
export function getOrderDetail(params) {
  return request({
    url: '/advertOrder/getOrder',
    method: 'get',
    params: params
  })
}
// 删除广告订单
export function deleteOrder(params) {
  return request({
    url: '/advertOrder/deleteOrderById',
    method: 'post',
    params: params
  })
}
// 批准广告订单
export function approveOrder(data) {
  return request({
    url: '/advertOrder/approve',
    method: 'post',
    data: data
  })
}
// 驳回广告订单
export function rejectOrder(data) {
  return request({
    url: '/advertOrder/reject',
    method: 'post',
    data: data
  })
}
// 订单流程信息
export function getProgressList(params) {
  return request({
    url: '/advertOrder/getProgressList',
    method: 'post',
    params: params
  })
}
// 获得媒体列表
export function getAllMedia() {
  return request({
    url: '/advertOrder/getAllMedia',
    method: 'get',
  })
}
// 获得回传列表
export function getBackOrder(data) {
  return request({
    url: '/advertOrder/getBackOrder',
    method: 'post',
    data: data
  })
}

// 获得接收列表
export function getOrderAcceptList(data) {
  return request({
    url: '/advertOrder/orderAcceptList',
    method: 'post',
    data: data
  })
}

//撤回
export function withdraw(params) {
  return request({
    url: '/advertOrder/withdraw',
    method: 'post',
    params: params
  })
}