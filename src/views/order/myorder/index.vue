<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      class="select"
    >
      <div class="searchContent">
        <el-form-item label="订单编号" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入订单编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="订单名称" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入订单名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
      </div>
      <div class="searchBtns">
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
      </div>
    </el-form>
    <el-row :gutter="10" class="mb8 add">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          >订单发起</el-button
        >
      </el-col>
    </el-row>

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
        width="120"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="投放结束时间"
        align="center"
        prop="endTime"
        width="120"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="创建人"
        align="center"
        prop="createName"
        width="100"
      /> -->
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="100"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="处理状态" align="center" prop="status" width="80">
        <template #default="scope">
          <dict-tag
            :options="sys_receive_handle_status"
            :value="scope.row.status"
          />
        </template>
      </el-table-column> -->
      <el-table-column label="状态" align="center" prop="status" width="70">
        <template #default="scope">
          <dict-tag
            :options="sys_receive_orde_status"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="200"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleEdit(scope.row)"
            v-if="scope.row.status == 0|| scope.row.status == 2"
            >处理</el-button
          >
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-if=" scope.row.status == 0 || scope.row.status == 2"
            >删除</el-button
          >
          <el-button
            link
            type="danger"
            icon="RefreshLeft"
            @click="handleRevoke(scope.row)"
            v-if=" scope.row.level == 2 && scope.row.status == 1"
            >撤回</el-button
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
      @pagination="getOrderList"
    />
  </div>
</template>

<script setup name="OrderList">
import { getorderList, deleteOrder ,withdraw} from "@/api/orderApi/addOrder";
import { onMounted } from "vue";

const router = useRouter();
const noticeList = ref([]);
// const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const { proxy } = getCurrentInstance();
const { sys_receive_orde_status, sys_receive_handle_status } = proxy.useDict(
  "sys_receive_orde_status",
  "sys_receive_handle_status"
);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    title: undefined,
  },
});
const { queryParams } = toRefs(data);

onMounted(() => {
  getOrderList();
});

//获取广告列表信息
const getOrderList = () => {
  let params = {
    ...queryParams.value,
  };
  getorderList(params).then((res) => {
    noticeList.value = res.data.list;
    total.value = res.data.total;
  });
};

// 搜索
function handleQuery() {
  queryParams.value.pageNum = 1;
  getOrderList();
}

// 重置
const resetQuery = () => {
  proxy.resetForm("queryRef");
  getOrderList();
};

// 新增
const handleAdd = () => {
  router.push({ path: "/order/addorder" , query: { type: "new" }  });
};

// 处理
const handleEdit = (row) => {
  router.push({ path: "/order/addorder", query: { id: row.id, type: "edit" } });
};
// 查看
const handleReview = (row) => {
  router.push({
    path: "/order/addorder",
    query: { id: row.id, type: "review" },
  });
};
const handleRevoke = (row) => {
    const orderNo = row.orderNo;
  proxy.$modal
    .confirm('是否确认撤回订单编号为"' + orderNo + '"的数据项？')
    .then(function () {
      return withdraw({ orderId: row.id });
    })
    .then(() => {
      getOrderList();
      proxy.$modal.msgSuccess("撤回成功");
    })
    // .catch((err) => {
    //     proxy.$modal.msgError(err);
    // });
};
// 删除
const handleDelete = (row) => {
  const orderNo = row.orderNo;
  proxy.$modal
    .confirm('是否确认删除订单编号为"' + orderNo + '"的数据项？')
    .then(function () {
      return deleteOrder({ id: row.id });
    })
    .then(() => {
      getOrderList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch((err) => {
        proxy.$modal.msgError(err);
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
