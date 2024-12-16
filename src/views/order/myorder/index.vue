<template>
    <div class="container">
        <div class="title">
            <div class="title-con">订单列表</div>
            <el-divider />
        </div>
    </div>
</template>

<script setup>
import {getorderList} from '@/api/OrderApi/addOrder';
import { onMounted } from 'vue';
//获取广告列表信息
const getOrderList = () => {
    let params = {
        orderName: '',
        orderNo: '',
        pageNum: 1,
        pageSize: 10
    }
    getorderList(params).then(res => {
        console.log(res)
    })
}
onMounted (() => {
    getOrderList()
})
</script>

<style lang="scss">
.container{
    width: 100%;
}
.title{
    width: 100%;
}
.title-con{
    width: 100%;
    margin: 2% 0 0 2%;
}
</style>