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
            <span>上传成果</span>
          </div>
        </template>
        <el-form>
          <el-form-item label="附件" label-width="100px">
            <fileUpload :fileSize="1024" :fileType="fileType"></fileUpload>
          </el-form-item>
          <el-form-item label="备注" label-width="100px">
            <el-input
              type="textarea"
              v-model="formData.descript"
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
import fileUpload from "@/components/FileUpload";
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
const fileType = [
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
];

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

.radioGreen {
  display: flex;
  background-color: rgb(103, 192, 103);
  border-radius: 10%;
  color: aliceblue;
  justify-content: center;
  width: 50px;
  height: 30px;
  font-weight: bold;
}
.radioRed {
  display: flex;
  background-color: lightcoral;
  border-radius: 10%;
  color: aliceblue;
  justify-content: center;
  width: 50px;
  height: 30px;
  font-weight: bold;
}
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
