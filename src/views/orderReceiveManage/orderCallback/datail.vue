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
              :isShowTip="false"
              @updateFileList="updateFileList"
              :fileList="fileMsg"
            >
            </fileUpload>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="box-card">
        <template #header>
          <div class="clearfix">
            <span>上传成果</span>
          </div>
        </template>
        <el-form :model="backData" ref="backDataRef" :rules="rules">
          <el-form-item label="附件" label-width="100px" prop="fileList">
            <fileUpload
              :fileSize="1024"
              :fileType="fileType"
              :fileList="fileList"
              @updateFileList="updateFileList"
            ></fileUpload>
          </el-form-item>
          <el-form-item label="备注" label-width="100px" prop="remark">
            <el-input
              type="textarea"
              v-model="backData.remark"
              placeholder="请输入"
            />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="form-bottom">
      <div class="form-bottom">
        <div class="bottom-btns">
          <el-button class="purple" @click="cancel">取消</el-button>
          <el-button class="radioGreen" @click="submitForm">提交</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { getOrderDetail, approveOrder } from "@/api/orderApi/addOrder";
import fileUpload from "@/components/FileUpload";
import useUserStore from "@/store/modules/user";

const router = useRouter();
const userStore = useUserStore();
const { proxy } = getCurrentInstance();
const type = ref(""); // 上传类型，可能是 'review' 或其他
const backDataRef = ref(null);
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
  backData: {
    remark: "",
    fileList: [],
  },
  rules: {
    fileList: [{ required: true, message: "请回传附件", trigger: "blur" }],
  },
});
const { formData, backData, rules } = toRefs(data);

// 响应式变量
const fileList = ref([]); //回传附件
const fileMsg = ref([]); //素材附件
const updateFileList = (fileListMsg) => {
  fileList.value = fileListMsg;
  backData.value.fileList = fileListMsg;
};
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
        fileList.value = backData.value = res.data.orderBackFiles;
        backData.remark = res.data.remark;
      })
      .catch((err) => {
        proxy.$modal.msgError(err.data.msg);
      });
  }
};
const submitForm = () => {
  backDataRef.value.validate((valid) => {
    if (valid) {
      let params = {
        id: formData.value.id,
        remark: backData.value.remark,
        orderBackFiles: backData.value.fileList,
        userId: userStore.id,
      };
      approveOrder(params)
        .then((res) => {
          proxy.$modal.msgSuccess("派单成功");
          router.go(-1);
        })
        .catch((err) => {
          proxy.$modal.msgError(err.data.msg);
        });
    }
  });
};
const cancel = () => {
  router.go(-1);
};

//提交
onMounted(() => {
  const detailId = router.currentRoute.value.query?.id;
  type.value = router.currentRoute.value.query?.type;
  if (detailId) {
    getDetail(detailId);
  }
});
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
