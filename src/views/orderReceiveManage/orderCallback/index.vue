<template>
  <div class="app-container more-select">
    <div class="form">
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        v-show="showSearch"
        :style="{ height: showExpend ? 'auto' : '' }"
      >
        <el-form-item label="订单编号" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入订单编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="订单名称" prop="orderName">
          <el-input
            v-model="queryParams.orderName"
            placeholder="请输入订单名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="回传状态" prop="backStatus">
          <el-select
            v-model="queryParams.backStatus"
            placeholder="回传状态"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="dict in sys_receive_back_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="select-expend">
        <div class="form-btns">
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button type="primary" icon="Search" @click="handleQuery"
            >搜索</el-button
          >
        </div>
        <span class="expend" @click="showExpend = !showExpend">
          <el-icon><Sort /></el-icon>
        </span>
      </div>
    </div>
    <el-table :data="noticeList">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column
        label="订单编号"
        align="center"
        prop="orderNo"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="订单名称"
        align="center"
        prop="title"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="投放开始时间"
        align="center"
        prop="startTime"
        width="160"
      >
        <!-- <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, "{y}-{m}-{d} {h}:{m}:{s}") }}</span>
        </template> -->
      </el-table-column>
      <el-table-column
        label="投放结束时间"
        align="center"
        prop="endTime"
        width="160"
      >
        <!-- <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, "{y}-{m}-{d} {h}:{m}:{s}") }}</span>
        </template> -->
      </el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="createName"
        width="100"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="160"
      >
        <!-- <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{m}:{s}") }}</span>
        </template> -->
      </el-table-column>
      <el-table-column
        label="回传状态"
        align="center"
        prop="status"
        width="120"
      >
        <template #default="scope">
          <dict-tag
            :options="sys_receive_back_status"
            :value="scope.row.isBack"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="160"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Upload"
            @click="handleEdit(scope.row)"
            v-if="scope.row.isBack != 1&&userStore.level == 4"
            >上传结果</el-button
          >
          <el-button
            link
            type="primary"
            icon="View"
            @click="handleReview(scope.row)"
            >查看</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getBackOrder"
    />
  </div>
</template>

<script setup name="OrderList">
import { getBackOrder, deleteOrder } from "@/api/orderApi/addOrder";
import { onMounted, ref } from "vue";

import useUserStore from "@/store/modules/user";
const router = useRouter();
const userStore = useUserStore();
const noticeList = ref([]);
// const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const showExpend = ref(false);
const { proxy } = getCurrentInstance();
const { sys_receive_back_status } = proxy.useDict("sys_receive_back_status");

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    orderName: undefined,
    backStatus: undefined,
  },
});

//获取广告列表信息
const getBackOrderList = () => {
  let params = {
    ...queryParams.value,
  };

  getBackOrder(params).then((res) => {
    noticeList.value = res.data.list;
    total.value = res.data.total;
  });
};
onMounted(() => {
  getBackOrderList();
});

const { queryParams } = toRefs(data);

// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getBackOrderList();
};

// 重置
const resetQuery = () => {
  proxy.resetForm("queryRef");
  getBackOrderList();
};

// 处理
const handleEdit = (row) => {
  router.push({
    path: "/orderReceive/callbackDetail",
    query: { id: row.id, type: "edit" },
  });
};
const handleReview = (row) => {
  router.push({
    path: "/orderReceive/callbackDetail",
    query: { id: row.id, type: "review" },
  });
};
</script>

<style lang="scss">
.select {
  display: flex;
  justify-content: space-between;
}
.searchBtns {
  margin: 0;
}
.add {
  display: flex;
  float: right;
}
.container {
  width: 100%;
}
.title {
  width: 100%;
}
.title-con {
  width: 100%;
  margin: 2% 0 0 2%;
}
</style>
