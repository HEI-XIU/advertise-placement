<template>
  <div class="container">
    <div class="base-info">
      <el-card class="box-card">
        <template #header>
          <div class="clearfix">
            <span>基本信息</span>
          </div>
        </template>
        <el-form
          :model="formData"
          class="formTable"
          ref="form"
          :disabled="true"
        >
          <el-form-item label="订单编号" label-width="110px" prop="orderNo">
            <el-input
              v-model="formData.orderNo"
              placeholder="系统生成"
              disabled
            />
          </el-form-item>
          <el-form-item label="发起人" label-width="110px" prop="createName">
            <el-input
              v-model="formData.createName"
              placeholder="系统带出"
              disabled
            />
          </el-form-item>
          <el-form-item label="订单名称" label-width="110px" prop="title">
            <el-input v-model="formData.title" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="创建时间" label-width="110px" prop="createTime">
            <el-input
              v-model="formData.createTime"
              placeholder="系统生成"
              disabled
            />
          </el-form-item>
          <el-form-item
            label="投放开始时间"
            label-width="110px"
            prop="startTime"
          >
            <el-date-picker
              style="width: 100%"
              v-model="formData.startTime"
              type="date"
              :editable="false"
              placeholder="请选择"
            />
          </el-form-item>

          <el-form-item label="投放结束时间" label-width="110px" prop="endTime">
            <el-date-picker
              style="width: 100%"
              v-model="formData.endTime"
              type="date"
              :editable="false"
              placeholder="请选择"
            />
          </el-form-item>

          <el-form-item
            label="需求描述"
            label-width="110px"
            style="width: 100%"
            prop="content"
          >
            <el-input
              type="textarea"
              v-model="formData.content"
              placeholder="请输入"
            />
          </el-form-item>
          <el-form-item label="附件" label-width="100px">
            <fileUpload
              style="width: 100%"
              :fileSize="1024"
              :isShowTip="false"
              :fileList="fileMsg"
            >
            </fileUpload>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="box-card" v-if="isShowCard">
        <template #header>
          <div class="clearfix">
            <span>派单处理</span>
          </div>
        </template>
        <el-form
          :model="editData"
          :rules="rules"
          ref="editDataRef"
          :disabled="isReview"
        >
          <el-form-item
            label="派单媒体"
            label-width="100px"
            prop="mediaId"
            v-if="userStore.level == 3"
          >
            <el-select v-model="editData.mediaId" placeholder="请选择">
              <el-option
                v-for="item in mediaList"
                :key="item.deptId"
                :label="item.deptName"
                :value="item.deptId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label-width="100px" prop="remark">
            <template #label>
              <span v-if="isReject"> 驳回意见</span>
              <span v-else> 派单意见 </span>
            </template>
            <el-input
              type="textarea"
              v-model="editData.remark"
              placeholder="请输入"
            />
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="box-card" v-loading="tasksLoad">
        <template #header>
          <div class="clearfix">
            <span>处理流程</span>
          </div>
        </template>
        <div class="block">
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in tasks"
              :key="index"
              :icon="getTimelineItemIcon(item)"
              :type="getTimelineItemType(item)"
            >
              <p style="font-weight: 700">任务：{{ item.name }}</p>
              <el-card :body-style="{ padding: '10px' }">
                <label
                  v-if="item.sysUser"
                  style="font-weight: normal; margin-right: 30px"
                >
                  审批人：{{ item.sysUser.nickName }}
                  <el-tag type="info" size="small">{{
                    item.sysUser.dept.deptName
                  }}</el-tag>
                </label>
                <label style="font-weight: normal" v-if="formData.createTime"
                  >创建时间：</label
                >
                <label style="color: #8a909c; font-weight: normal">{{
                  formData.createTime
                }}</label>
                <label
                  v-if="item.createTime"
                  style="margin-left: 30px; font-weight: normal"
                  >审批时间：</label
                >
                <label
                  v-if="item.createTime"
                  style="color: #8a909c; font-weight: normal"
                >
                  {{ item.createTime }}</label
                >

                <p v-if="item.mediaId">
                  <label
                    v-if="item.mediaId"
                    style="margin-right: 10px; font-weight: normal"
                    >接收媒体：</label
                  >
                  <label
                    v-if="item.mediaId"
                    style="color: #e6a23c; font-weight: bold"
                  >
                    {{ item.mediaName }}
                  </label>
                </p>

                <p v-if="item.remark">
                  <span style="margin-right: 10px" v-if="item.nameKey == 2"
                    >驳回意见</span
                  >
                  <span style="margin-right: 10px" v-else>派单意见:</span>
                  <el-tag
                    :type="getTimelineItemType(item)"
                    class="reason-tag"
                    :title="item.remark"
                  >
                    {{ item.remark }}
                  </el-tag>
                </p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>

    <div class="form-bottom">
      <div class="form-bottom">
        <div class="bottom-btns">
          <el-button class="purple" @click="cancel" type="info">取消</el-button>
          <el-button
            type="danger"
            class="btnRed"
            @click="rejectDialogOpen"
            v-loading="submitLoading"
            v-if="isShow && !isReview"
            >驳回派单</el-button
          >
          <el-button
            type="primary"
            class="btnGreen"
            @click="approve"
            v-loading="submitLoading"
            v-if="isShow && !isReview"
            >通过派单</el-button
          >
          <el-button
            type="primary"
            class="btnGreen"
            @click="receive"
            v-loading="submitLoading"
            v-if="!isShow && !isReview"
            >接收派单</el-button
          >
        </div>
      </div>
    </div>
    <el-dialog
      title="驳回原因"
      v-model="rejectDialog"
      width="800px"
      style="margin-top: 30vh !important"
    >
      <el-form
        :model="editData"
        :rules="rules"
        ref="rejectReasonRef"
        :disabled="isReview"
      >
        <el-form-item prop="reason">
          <el-input
            type="textarea"
            v-model="editData.reason"
            placeholder="请输入"
          />
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button type="primary" @click="reject">确定</el-button>
        <el-button @click="rejectDialog = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
import {
  approveOrder,
  rejectOrder,
  getOrderDetail,
  getProgressList,
  getAllMedia,
} from "@/api/orderApi/addOrder";
import useUserStore from "@/store/modules/user";
import { el } from "element-plus/es/locales.mjs";
const router = useRouter();
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const data = reactive({
  formData: {
    id: "", //订单id
    orderNo: "",
    createBy: "",
    createName: "",
    title: "",
    createTime: "",
    startTime: "",
    endTime: "",
    content: "",
  },
  editData: {
    mediaId: null,
    deptId: null,
    remark: "",
    userId: userStore.id,
    operate: "",
    reason: undefined,
  },
  rules: {
    operate: [{ required: true, message: "请选择操作", trigger: "blur" }],
    remark: [{ required: true, message: "请输入派单意见", trigger: "blur" }],
    reason: [{ required: true, message: "请输入驳回原因", trigger: "blur" }],
    mediaId: [{ required: true, message: "请选择派单媒体", trigger: "blur" }],
  },
});

const { formData, editData, rules } = toRefs(data);

const mediaList = ref([]);
const mediaHandler = ref(null);
const fileMsg = ref([]);
const editDataRef = ref(null);
const rejectReasonRef = ref(null);

const type = ref(""); // 可能是 'review' 或其他
const isShow = ref(userStore.level != 4 ? true : false);
const isShowCard = ref(
  userStore.level != 1 && userStore.level != 4 ? true : false
);
const isReview = ref(false);
const rejectDialog = ref(false);
const isReject = ref(false);
const submitLoading = ref(false);
const tasksLoad = ref(false);
const tasks = ref([]);
onMounted(() => {
  getMediaList();
  const detailId = router.currentRoute.value.query?.id;
  type.value = router.currentRoute.value.query?.type;
  isReview.value = type.value == "review" ? true : false;
  if (detailId) {
    getDetail(detailId);
    getTasks(detailId);
  }
});
const getDetail = (detailId) => {
  if (detailId) {
    getOrderDetail({ id: detailId })
      .then((res) => {
        formData.value.id = res.data.id;
        formData.value.createName = res.data.createName;
        formData.value.orderNo = res.data.orderNo;
        formData.value.title = res.data.title;
        formData.value.createTime = res.data.createTime;
        formData.value.startTime = res.data.startTime;
        formData.value.endTime = res.data.endTime;
        formData.value.content = res.data.content;
        fileMsg.value = res.data.orderFiles;
      })
      .catch((err) => {
        proxy.$modal.msgError(err);
      });
  }
};
const getMediaList = () => {
  getAllMedia().then((res) => {
    mediaList.value = res.data;
  });
};
const getTasks = (detailId) => {
  getProgressList({ orderId: detailId }).then((res) => {
    const foundElement = res.data.find(
      (element) => element.userId === userStore.id
    );
    if (foundElement?.nameKey == 2) {
      if (!isReview.value) {
        editData.value.remark = "";
        editData.value.mediaId = "";
      } else {
        editData.value.remark = foundElement?.remark;
        editData.value.mediaId = foundElement?.mediaId;
      }
      isReject.value = true;
    } else {
      if (!isReview.value) {
        editData.value.remark = "";
        editData.value.mediaId = "";
      } else {
        editData.value.remark = foundElement?.remark;
        editData.value.mediaId = foundElement?.mediaId;
      }
      isReject.value = false;
    }
    tasks.value = res.data.map(item=>{
      return {
        ...item,
        mediaName: item.mediaId?mediaList.value.find((media) =>  {
          return media.deptId == item.mediaId
      }).deptName:""
      }
    });
  });
};
const rejectDialogOpen = () => {
  rejectDialog.value = true;
  proxy.resetForm("rejectReasonRef");
};
const reject = () => {
  rejectReasonRef.value.validate((valid) => {
    if (valid) {
      let params = {
        id: formData.value.id,
        mediaId: editData.value.mediaId,
        deptId: editData.value.mediaId,
        remark: editData.value.reason,
        userId: editData.value.userId,
      };
      rejectOrder(params)
        .then((res) => {
          cancel();
          proxy.$modal.msgSuccess("驳回成功");
        })
        .catch((err) => {
          proxy.$modal.msgError(err.data.msg);
        });
    }
  });
};
const approve = () => {
  editDataRef.value.validate((valid) => {
    if (valid) {
      let params = {
        id: formData.value.id,
        mediaId: editData.value.mediaId,
        deptId: editData.value.mediaId,
        remark: editData.value.remark,
        userId: editData.value.userId,
      };
      approveOrder(params)
        .then((res) => {
          cancel();
          proxy.$modal.msgSuccess("派单成功");
        })
        .catch((err) => {
          proxy.$modal.msgError(err.data.msg);
        });
    }
  });
};
const receive = () => {
  let params = {
    id: formData.value.id,
    mediaId: editData.value.mediaId,
    deptId: editData.value.mediaId,
    remark: editData.value.remark,
    userId: editData.value.userId,
  };
  approveOrder(params)
    .then((res) => {
      cancel();
      proxy.$modal.msgSuccess("派单成功");
    })
    .catch((err) => {
      proxy.$modal.msgError(err.data.msg);
    });
};
const cancel = () => {
  router.push("/orderReceive/receiveList");
};

const getTimelineItemIcon = (item) => {
  if (item.nameKey === 0) {
    return "Location";
  }
  if (item.nameKey === 1) {
    return "Check";
  }
  if (item.nameKey === 2) {
    return "Close";
  }
  if (item.nameKey === 3) {
    return "Check";
  }
  if (item.nameKey === 4) {
    return "Check";
  }
  return "";
};
const getTimelineItemType = (item) => {
  if (item.nameKey === 0) {
    return "info";
  }
  if (item.nameKey === 1) {
    return "warning";
  }
  if (item.nameKey === 2) {
    return "danger";
  }
  if (item.nameKey === 3) {
    return "primary";
  }
  if (item.nameKey === 4) {
    return "success";
  }
  return "";
};
</script>
<style lang="scss" scoped>
.container {
  width: 100%;
  background: #ffffff;
}
.el-divider--horizontal {
  margin: 10px 0;
}
.fullWith {
  width: 100%;
}
.box-card {
  width: 100%;
  box-sizing: border-box;
  box-shadow: none;
  border-radius: 0;
  border: none;
  .clearfix {
    span {
      font-size: 16px;
      padding-bottom: 4px;
      color: #3d3d3d;
      &::before {
        padding-right: 5px;
      }
    }
  }
}

.base-info {
  height: 85vh;
  overflow: auto;
  .formTable {
    display: flex;
    flex-wrap: wrap;
  }
}

.formTable .el-form-item {
  width: 50%;
  box-sizing: border-box;
  padding-right: 20px; /* 根据需要调整间距 */
}

.formTable .el-form-item:last-child {
  width: 100%; /* 如果最后一项需要占满一行 */
}

.formTable {
  width: 100%;
}
.reason-tag {
  display: inline-block;
  height: auto;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.5;
  text-align: left;
}
.dialog-footer {
  display: flex;
  justify-content: center;
}
</style>
