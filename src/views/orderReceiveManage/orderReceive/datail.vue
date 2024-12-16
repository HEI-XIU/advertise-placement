<template>
  <div class="container">
    <div class="base-info">
      <el-card class="box-card">
        <template #header>
            <div class="clearfix">
              <span>基本信息</span>
            </div>
          </template>
        <el-form :model="formData" class="formTable" label-position="right">
          <el-form-item label="订单编号" label-width="100px">
            <el-input
              v-model="formData.orderId"
              placeholder="系统自动带出"
              clearable
            />
          </el-form-item>

          <el-form-item label="发起人" label-width="100px">
            <el-input
              v-model="formData.createby"
              placeholder="系统自动带出"
              clearable
            />
          </el-form-item>

          <el-form-item label="订单名称" label-width="100px">
            <el-input
              v-model="formData.orderName"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
          <el-form-item label="创建时间" label-width="100px">
            <el-input
              v-model="formData.createTime"
              placeholder="请输入"
              clearable
            />
          </el-form-item>

          <el-form-item label="投放开始时间" label-width="100px">
            <el-date-picker
              style="width: 100%"
              v-model="formData.startTime"
              type="date"
              :editable="false"
              :placeholder="!statusDisable ? '请选择' : ''"
            />
          </el-form-item>

          <el-form-item label="投放结束时间" label-width="100px">
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
            label-width="100px"
            style="width: 100%"
          >
            <el-input
              type="textarea"
              v-model="formData.descript"
              placeholder="请输入"
            />
          </el-form-item>
          <el-form-item label="附件信息" prop="fileList" class="upload-item">
            <el-upload
              action=""
              :http-request="beforeUpload"
              :before-upload="uploadBefore"
              :limit="10"
              :on-change="handleChange"
              :on-exceed="handleExceed"
              :file-list="fileList"
              :on-preview="clickFile"
              :on-remove="removeFile"
              :disabled="type == 'review' || !showSubmit"
            >
            </el-upload>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="box-card">
        <template #header>
            <div class="clearfix">
              <span>派单处理</span>
            </div>
          </template>
        <el-form>
          <el-form-item label="操作" label-width="100px">
            <el-radio-group v-model="formData.status">
              <el-radio label="1">
                <span class="radioRed">驳回</span>
                </el-radio>
              <el-radio label="2">
                <span class="radioGreen">通过</span>
                </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="派单意见 " label-width="100px">
            <el-input
              type="textarea"
              v-model="formData.descript"
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
                  v-if="item.assigneeUser"
                  style="font-weight: normal; margin-right: 30px"
                >
                  审批人：{{ item.assigneeUser.nickname }}
                  <el-tag type="info" size="mini">{{
                    item.assigneeUser.deptName
                  }}</el-tag>
                </label>
                <label style="font-weight: normal" v-if="item.createTime"
                  >创建时间：</label
                >
                <label style="color: #8a909c; font-weight: normal">{{
                  item.createTime
                }}</label>
                <label
                  v-if="item.endTime"
                  style="margin-left: 30px; font-weight: normal"
                  >审批时间：</label
                >
                <label
                  v-if="item.endTime"
                  style="color: #8a909c; font-weight: normal"
                >
                  {{ item.endTime }}</label
                >
                <label
                  v-if="item.durationInMillis"
                  style="margin-left: 30px; font-weight: normal"
                  >耗时：</label
                >
                <label
                  v-if="item.durationInMillis"
                  style="color: #8a909c; font-weight: normal"
                >
                  <!-- {{ getDateStar(item.durationInMillis) }} -->
                </label>
                <p v-if="item.reason">
                  <el-tag
                    :type="getTimelineItemType(item)"
                    class="reason-tag"
                    :title="item.reason"
                    >{{ item.reason }}</el-tag
                  >
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
          <el-button class="purple" @click="cancel">取消</el-button>
          <el-button class="purple" @click="saveForm">保存</el-button>
          <el-button
            class="purple"
            @click="submitForm"
            v-loading="submitLoading"
            >提交派单</el-button
          >
          <!-- <el-button @click="cancel">取消</el-button>
          <el-button class="purple" @click="revoke">撤回</el-button> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { uploadFile, downloadFile, submitTab } from "@/api/OrderApi/addOrder";
const formData = ref({
  orderId: "",
  createby: "",
  orderName: "",
  createTime: ref(getCurrentTime()),
  startTime: "",
  endTime: "",
  descript: "",
});
//文件上传
// 响应式变量
const fileList = ref([]);
const fileMsg = ref([]);
const submitLoading = ref(false);
const tasksLoad = ref(false);
const tasks = ref([
  {
    id: "499e2e2a-b15e-11ef-b7d9-4a07930dfe67",
    name: "商机申请发起",
    claimTime: null,
    createTime: "2024-12-03 18:06:39",
    suspensionState: null,
    no: null,
    processInstanceId: "f65dd86d-b150-11ef-b7d9-4a07930dfe67",
    processDefinitionKey: null,
    processInstance: {
      id: "f65dd86d-b150-11ef-b7d9-4a07930dfe67",
      name: "商机申请",
      startUserId: 182,
      startUserNickname: "测试用户",
      processDefinitionId:
        "oa_opportunity:5:4c86c157-95df-11ef-802a-eeeeeeeeeeee",
      businessStatus: "0",
    },
    endTime: null,
    durationInMillis: null,
    result: 1,
    reason: null,
    definitionKey: "Activity_1h0js95",
    assigneeUser: {
      id: 182,
      nickname: "测试用户",
      deptId: 54,
      deptName: "研发部门",
    },
    parentTaskId: null,
    children: null,
  },
  {
    id: "f680a2c1-b150-11ef-b7d9-4a07930dfe67",
    name: "部门负责人审批",
    claimTime: null,
    createTime: "2024-12-03 16:31:16",
    suspensionState: null,
    no: null,
    processInstanceId: "f65dd86d-b150-11ef-b7d9-4a07930dfe67",
    processDefinitionKey: null,
    processInstance: {
      id: "f65dd86d-b150-11ef-b7d9-4a07930dfe67",
      name: "商机申请",
      startUserId: 182,
      startUserNickname: "测试用户",
      processDefinitionId:
        "oa_opportunity:5:4c86c157-95df-11ef-802a-eeeeeeeeeeee",
      businessStatus: "0",
    },
    endTime: "2024-12-03 18:06:39",
    durationInMillis: 5722899,
    result: 5,
    reason: "发票信息",
    definitionKey: "Activity_033jtv4",
    assigneeUser: {
      id: 278,
      nickname: "宋福康",
      deptId: 54,
      deptName: "研发部门",
    },
    parentTaskId: null,
    children: null,
  },
  {
    id: "f65e9bc7-b150-11ef-b7d9-4a07930dfe67",
    name: "商机申请发起",
    claimTime: null,
    createTime: "2024-12-03 16:31:16",
    suspensionState: null,
    no: null,
    processInstanceId: "f65dd86d-b150-11ef-b7d9-4a07930dfe67",
    processDefinitionKey: null,
    processInstance: {
      id: "f65dd86d-b150-11ef-b7d9-4a07930dfe67",
      name: "商机申请",
      startUserId: 182,
      startUserNickname: "测试用户",
      processDefinitionId:
        "oa_opportunity:5:4c86c157-95df-11ef-802a-eeeeeeeeeeee",
      businessStatus: "0",
    },
    endTime: "2024-12-03 16:31:16",
    durationInMillis: 220,
    result: 2,
    reason: "创建任务",
    definitionKey: "Activity_1h0js95",
    assigneeUser: {
      id: 182,
      nickname: "测试用户",
      deptId: 54,
      deptName: "研发部门",
    },
    parentTaskId: null,
    children: null,
  },
]);

// 获取当前时间的函数
function getCurrentTime() {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
}

// 自定义上传逻辑
const beforeUpload = (params) => {
  let formData = new FormData();
  formData.append("file", params.file);
  // 上传文件
  uploadFile(formData).then((res) => {
    if (res.success) {
      Message.success("文件解析成功！");
      this.fileMsg.push(res.data);
    } else {
      Message.error("导入解析失败！");
    }
    // this.fileList = [];
  });
};

const uploadBefore = (file) => {
  let suffix = file.name.substring(file.name.lastIndexOf(".") + 1);
  if (
    !(
      suffix === "doc" ||
      suffix === "docx" ||
      suffix === "xls" ||
      suffix === "xlsx" ||
      suffix === "pdf" ||
      suffix === "jpg" ||
      suffix === "png" ||
      suffix === "xls" ||
      suffix === "xlsx" ||
      suffix === "et" ||
      suffix === "html" ||
      suffix === "pdf" ||
      suffix === "gif" ||
      suffix === "jpg" ||
      suffix === "jpeg" ||
      suffix === "bmp" ||
      suffix === "png" ||
      suffix === "zip" ||
      suffix === "rar" ||
      suffix === "ppt" ||
      suffix === "pptx" ||
      suffix === "txt"
    )
  ) {
    Message.warning("上传文件只能是支持的格式!");
    return false;
  }

  const isLt2M = file.size / 1024 / 1024 < 50; //这里做文件大小限制
  if (!isLt2M) {
    Message.warning("上传文件大小不能超过 50MB!");
    return false;
  }
  return true;
};

// 其他事件处理函数
const handleChange = (file, fileList) => {
  fileList = fileList;
};

const handlePreview = (file) => {
  console.log("预览文件", file);
};

//点击文件
const clickFile = (file) => {
  let fileUrl = "";
  let fileName = "";
  fileMsg.forEach((item) => {
    if (file.name == item.fileName) {
      fileUrl = item.fileUrl;
      fileName = item.fileName;
    }
  });
  downloadFile(fileUrl)
    .then((res) => {
      var debug = res;
      if (debug) {
        var elink = document.createElement("a");
        elink.download = fileName;
        elink.style.display = "none";
        var blob = new Blob([debug], { type: "application/x-msdownload" });
        elink.href = URL.createObjectURL(blob);
        document.body.appendChild(elink);
        elink.click();
        document.body.removeChild(elink);
      } else {
        this.$message.error("下载异常");
      }
    })
    .catch((err) => {});
};
//移除文件
const removeFile = (file) => {
  let index = null;
  fileMsg.forEach((item, i) => {
    if (file.name == item.fileName) {
      index = i;
    }
  });
  fileMsg.splice(index, 1);
};
const handleExceed = () => {
  Message.warning("上传文件数量不能超过10个!");
};
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份从 0 开始，需要 +1
  const day = date.getDate().toString().padStart(2, "0"); // 日期补零

  return `${year}-${month}-${day}`;
}
//提交
const submitForm = () => {
  console.log(formatDate(formData.value.startTime));
  let params = {
    amount: "",
    assignedMedia: "",
    content: formData.value.descript,
    createBy: 1001,
    createTime: formData.value.createTime,
    currentHandler: "",
    endTime: formatDate(formData.value.endTime),
    id: "",
    isBack: "",
    level: "",
    orderNo: "ORD123456789",
    remark: "",
    startTime: formatDate(formData.value.startTime),
    status: "",
    title: formData.value.orderName,
    updateBy: "",
    updateTime: "",
  };
  console.log(params);
};
onMounted(() => {});

const getTimelineItemIcon = (item) => {
  if (item.result === 1) {
    return "el-icon-time";
  }
  if (item.result === 2) {
    return "el-icon-check";
  }
  if (item.result === 3) {
    return "el-icon-close";
  }
  if (item.result === 4) {
    return "el-icon-remove-outline";
  }
  if (item.result === 5) {
    return "el-icon-back";
  }
  return "";
};
const getTimelineItemType = (item) => {
  if (item.result === 1) {
    return "primary";
  }
  if (item.result === 2) {
    return "success";
  }
  if (item.result === 3) {
    return "danger";
  }
  if (item.result === 4) {
    return "info";
  }
  if (item.result === 5) {
    return "warning";
  }
  if (item.result === 6) {
    return "default";
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
    border:none;
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

.base-info .formTable {
  display: flex;
  flex-wrap: wrap;
}

.formTable .el-form-item {
  width: 50%;
  box-sizing: border-box;
  padding-right: 20px; /* 根据需要调整间距 */
}

.formTable .el-form-item:last-child {
  width: 100%; /* 如果最后一项需要占满一行 */
}

.title {
  width: 100%;
}
.title-con {
  width: 100%;
  margin: 0 0 0 2%;
}

.formTable {
  width: 100%;
}

.radioGreen{
    display: flex;
    background-color: rgb(103, 192, 103); 
    border-radius: 10%;
    color: aliceblue;
    justify-content: center;
    width: 50px;
    height: 30px;
    font-weight: bold;
}
.radioRed{
    display: flex;
    background-color: lightcoral; 
    border-radius: 10%;
    color: aliceblue;
    justify-content: center;
    width: 50px;
    height: 30px;
    font-weight: bold;
}
/*.base-info {
  padding-left: 0;
  padding-right: 0;

  .el-input__inner {
    height: 40px !important;
  }

  .el-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .el-col {
    display: flex;
    flex: 1;
    justify-content: flex-start;
  }


  .el-input_icon.el-range_icon.el-icon-date {
    width: 200px !important;
    background: #00afff !important;
  }
}
*/
.form-bottom {
  width: 100%;
  background: #ffffff;
}
.bottom-btns {
  width: 100%;
  display: flex;
  justify-content: center;
}
.purple {
  width: 100px;
  background-color: #169bd5;
  color: #ffffff;
}
</style>
