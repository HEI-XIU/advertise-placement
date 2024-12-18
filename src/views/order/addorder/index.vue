<template>
  <div class="container">
    <!-- <div class="title">
        <div class="title-con">订单发起</div>
      </div> -->
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
          label-position="right"
          :rules="rules"
          ref="form"
          :disabled="isDisabled"
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
              :placeholder="!statusDisable ? '请选择' : ''"
            />
          </el-form-item>

          <el-form-item label="投放结束时间" label-width="110px" prop="endTime">
            <el-date-picker
              style="width: 100%"
              v-model="formData.endTime"
              type="date"
              :editable="false"
              :placeholder="!statusDisable ? '请选择' : ''"
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
              :fileType="fileType"
              @updateFileList="updateFileList"
              :fileList="fileMsg"
            >
            </fileUpload>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="form-bottom">
      <div class="form-bottom">
        <div class="bottom-btns">
          <el-button class="purple" @click="cancel">取消</el-button>
          <el-button class="radioGreen" @click="saveForm">保存</el-button>
          <el-button
            class="radioGreen"
            @click="submitForm"
            v-loading="submitLoading"
            >派单</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import {
  submitorderTab,
  saveorderTab,
  getuserinfo,
  getOrderDetail,
} from "@/api/orderApi/addOrder";
import useUserStore from "@/store/modules/user";
const fileType = ref([
  "doc",
  "docx",
  "xls",
  "xlsx",
  "pdf",
  "jpg",
  "png",
  "zip",
  "ppt",
  "pptx",
]);
const router = useRouter();
const userStore = useUserStore();

const formData = ref({
  id: "", //订单id
  orderNo: "",
  createBy: userStore.id,
  createName: userStore.nickName,
  title: "",
  createTime: "",
  startTime: "",
  endTime: "",
  content: "",
});
// 校验规则对象
const form = ref(null);
const rules = {
  title: [{ required: true, message: "订单名称不能为空", trigger: "blur" }],
  // createTime: [{ required: true, message: "创建时间不能为空", trigger: "blur" },],
  startTime: [
    { required: true, message: "投放开始时间不能为空", trigger: "blur" },
  ],
  endTime: [
    { required: true, message: "投放结束时间不能为空", trigger: "blur" },
  ],
  content: [{ required: true, message: "需求描述不能为空", trigger: "blur" }],
};
// 响应式变量
const type = ref(""); // 上传类型，可能是 'review' 或其他
const isDisabled = ref(type == "review" ? true : false);
const fileList = ref([]);
const fileMsg = ref([]);

onMounted(() => {
  const detailId = router.currentRoute.value.query?.id;
  type.value = router.currentRoute.value.query?.type;
  // getuserInfo();
  if (detailId) getDetail(detailId);
});

//获取当前用户信息
// const getuserInfo = () => {
//   getuserinfo().then((res) => {
//     formData.value.createBy = res.user.userId;
//     formData.value.createName = res.user.nickName;
//   });
// };

const getDetail = (detailId) => {
  if (detailId) {
    getOrderDetail({ id: detailId })
      .then((res) => {
        formData.value.id = res.data.id;
        formData.value.createBy = res.data.createBy;
        formData.value.orderNo = res.data.orderNo;
        formData.value.title = res.data.title;
        formData.value.createTime = res.data.createTime;
        formData.value.startTime = res.data.startTime;
        formData.value.endTime = res.data.endTime;
        formData.value.content = res.data.content;
        fileMsg.value = res.data.orderFiles;
      })
      .catch((err) => {
        proxy.$modal.msgError(err.data.msg);
      });
  }
};

const updateFileList = (fileListMsg) => {
  fileMsg.value = fileListMsg;
};

const formatDate = (date) => {
  date = new Date(date);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份从 0 开始，需要 +1
  const day = date.getDate().toString().padStart(2, "0"); // 日期补零

  const hours = date.getHours().toString().padStart(2, "0"); // 时补零
  const minutes = date.getMinutes().toString().padStart(2, "0"); // 分补零
  const seconds = date.getSeconds().toString().padStart(2, "0"); // 秒补零

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 保存方法
const saveForm = () => {
  form.value.validate((valid) => {
    if (valid) {
      // 校验通过，执行保存逻辑
      let params = {
        id: formData.value.id,
        content: formData.value.content,
        createBy: formData.value.createBy,

        createTime: formData.value.createTime,
        startTime: formatDate(formData.value.startTime),
        endTime: formatDate(formData.value.endTime),
        orderNo: formData.value.orderNo,
        title: formData.value.title,
        orderFiles: fileMsg.value,
      };
      saveorderTab(params)
        .then(() => {
          cancel();
          proxy.$modal.msgSuccess("保存成功");
        })
        .catch(() => {
          proxy.$modal.msgError("保存失败");
        });
    }
  });
};

//提交
const submitForm = () => {
  form.value.validate((valid) => {
    if (valid) {
      let params = {
        id: formData.value.id,
        content: formData.value.content,
        createBy: formData.value.createBy,
        createTime: formData.value.createTime,
        startTime: formatDate(formData.value.startTime),
        endTime: formatDate(formData.value.endTime),
        orderNo: formData.value.orderNo,
        title: formData.value.title,
        orderFiles: fileMsg.value,
      };
      submitorderTab(params)
        .then(() => {
          console.log(123);
          cancel();
          proxy.$modal.msgSuccess("提交成功");
        })
        .catch(() => {
          proxy.$modal.msgError("提交失败");
        });
    }
  });
};
const cancel = () => {
  router.push("/order/myorder");
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
</style>
