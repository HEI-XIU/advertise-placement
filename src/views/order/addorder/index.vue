<template>
    <div class="container">
        <div class="title">
            <div class="title-con">订单发起</div>
            <el-divider />
        </div>
      <div class="form">
        <el-form :model="formData" ref="form" label-position="right" :rules = "rules">
          <div class="base-info">
            <!-- 第一行 -->
            <el-row :gutter="30">
              <el-col :xs="24" :sm="12" :md="11">
                <el-form-item label="订单编号" label-width="100px" prop="orderId">
                  <el-input style="width: 100%;" disabled v-model="formData.orderId" placeholder="系统自动带出" clearable />
                </el-form-item>
              </el-col>
  
              <el-col :xs="24" :sm="12" :md="11">
                <el-form-item label="发起人" label-width="100px" prop="createBy">
                  <el-input style="width: 100%;" disabled v-model="formData.createBy" placeholder="系统自动带出" clearable />
                </el-form-item>
              </el-col>
            </el-row>
  
            <!-- 第二行 -->
            <el-row :gutter="30">
              <el-col :xs="24" :sm="12" :md="11">
                <el-form-item label="订单名称" label-width="100px" prop="orderName">
                  <el-input style="width: 100%;" v-model="formData.orderName" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
  
              <el-col :xs="24" :sm="12" :md="11">
                <el-form-item label="创建时间" label-width="100px" prop="createTime">
                  <el-input style="width: 100%;" v-model="formData.createTime" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
            </el-row>
  
            <!-- 第三行 -->
            <el-row :gutter="30">
              <el-col :xs="24" :sm="12" :md="11">
                <el-form-item label="投放开始时间" label-width="110px" prop="startTime">
                  <el-date-picker
                  style="width: 100%;"
              v-model="formData.startTime"
              type="date"
              :editable="false"
              :placeholder="!statusDisable ? '请选择' : ''"
            />
                </el-form-item>
              </el-col>
  
              <el-col :xs="24" :sm="12" :md="11">
                <el-form-item label="投放结束时间" label-width="110px" prop="endTime">
                  <el-date-picker
                   style="width: 100%;"
              v-model="formData.endTime"
              type="date"
              :editable="false"
              :placeholder="!statusDisable ? '请选择' : ''"
            />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="需求描述" label-width="100px" prop="descript">
                  <el-input style="width: 100%;" type="textarea" v-model="formData.descript" placeholder="请输入" />
                </el-form-item>
                <el-form-item
            label="附件信息"
            prop="fileList"
          >
          </el-form-item>
          <el-form-item class="upload-item">
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
              <el-button
                icon="el-icon-plus"
                size="mini"
                type="primary"
                :disabled="false"
              >点击上传附件
              </el-button>
              <div slot="tip" class="el-upload__tip">
                限制文件大小：50M，限制文件总数量：10个，格式：txt,doc,docx,xls,xlsx,et,html,pdf,gif,jpg,jpeg,bmp,png,zip,rar,ppt,pptx
              </div>
            </el-upload>
          </el-form-item>
          </div>
        </el-form>
      </div>
      <div class="form-bottom">
      <div class="form-bottom">
        <div class="bottom-btns">
          <el-button class="purple" @click="cancel">取消</el-button>
          <el-button class="purple" @click="saveForm">保存</el-button>
          <el-button class="purple" @click="submitForm" v-loading="submitLoading">提交派单</el-button>
          <!-- <el-button @click="cancel">取消</el-button>
          <el-button class="purple" @click="revoke">撤回</el-button> -->
        </div>
      </div>
    </div>
    </div>
  </template>
<script setup>
import { onMounted, ref } from 'vue';
import { uploadFile,downloadFile,submitorderTab,saveorderTab,getuserinfo } from '@/api/OrderApi/addOrder';
// import {Message} from "element-ui";
const router = useRouter()
const formData = ref({
    userId:'',
    orderId:'',
    createBy:'',
    orderName:'',
    createTime:ref(getCurrentTime()),
    startTime:'',
    endTime:'',
    descript:'',
})

// 校验规则对象
const form = ref(null)
const rules = {
  orderId: [
    { required: true, message: '订单编号不能为空', trigger: 'blur' }
  ],
  createBy: [
    { required: true, message: '发起人不能为空', trigger: 'blur' }
  ],
  orderName: [
    { required: true, message: '订单名称不能为空', trigger: 'blur' }
  ],
  createTime: [
    { required: true, message: '创建时间不能为空', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '投放开始时间不能为空', trigger: 'blur' }
  ],
  endTime: [
    { required: true, message: '投放结束时间不能为空', trigger: 'blur' }
  ],
  descript: [
    { required: true, message: '需求描述不能为空', trigger: 'blur' }
  ]
};

//获取当前用户信息
const getuserInfo = () => {
  getuserinfo().then(res => {
    console.log(res)
    formData.value.createBy = res.user.nickName
    formData.value.userId = res.user.userId
  })
};

//文件上传
// 响应式变量
const fileList = ref([]);
const fileMsg = ref([]);

// 获取当前时间的函数
function getCurrentTime() {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};


// 自定义上传逻辑
 const beforeUpload =(params) => {
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
  console.log('预览文件', file);
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
            var blob = new Blob([debug], {type: "application/x-msdownload"});
            elink.href = URL.createObjectURL(blob);
            document.body.appendChild(elink);
            elink.click();
            document.body.removeChild(elink);
          } else {
            this.$message.error("下载异常");
          }
        })
        .catch((err) => {
        });
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
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从 0 开始，需要 +1
  const day = date.getDate().toString().padStart(2, '0'); // 日期补零

  const hours = date.getHours().toString().padStart(2, '0'); // 时补零
  const minutes = date.getMinutes().toString().padStart(2, '0'); // 分补零
  const seconds = date.getSeconds().toString().padStart(2, '0'); // 秒补零
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 保存方法
const saveForm = () => {
  // 调用表单的 validate 方法
  form.value.validate((valid) => {
    if (valid) {
      // 校验通过，执行保存逻辑
      let params = {
        amount: '',
        assignedMedia: '',
        content: formData.value.descript,
        createBy: formData.value.userId,
        createTime: formData.value.createTime,
        currentHandler: '',
        endTime: formatDate(formData.value.endTime),
        id: '',
        isBack: '',
        level: '',
        orderNo: 'ORD123456789',
        remark: '',
        startTime: formatDate(formData.value.startTime),
        status: '',
        title: formData.value.orderName,
        updateBy: '',
        updateTime: ''
      };

      saveorderTab(params).then((res) => {
        console.log(res);
        if (res.code === 200) {
          router.push('/order/myorder');
        }
      }).catch(() => {
        // 错误处理
      });

      console.log(params);
    } else {
      // 校验不通过，输出提示
      console.log('表单验证失败');
    }
  });
};

    //提交
    const submitForm = () => {
        console.log(formatDate(formData.value.startTime))
        let params = {
            amount: '',
            assignedMedia: '',
            content: formData.value.descript,
            createBy: formData.value.userId,
            createTime: formData.value.createTime,
            currentHandler: '',
            endTime: formatDate(formData.value.endTime),
            id: '',
            isBack: '',
            level: '',
            orderNo: "ORD123456789",
            remark: '',
            startTime: formatDate(formData.value.startTime),
            status: '',
            title: formData.value.orderName,
            updateBy: '',
            updateTime: '',
        }
        submitorderTab(params).then( (res) => {
          console.log(res)
          if(res.code==200){ 
            router.push('/order/myorder')
          }
        }).catch(() => {
             
            });
        console.log(params)
    }
onMounted(() => {
  getuserInfo()
});
</script>
<style scoped>
.container {
  width: 100%;
}

.title{
    width: 100%;
}
.title-con{
    width: 100%;
    margin: 2% 0 0 2%;
}

.form {
  width: 100%;
  padding: 2% 5% 0 5%;
}

.base-info {
  padding-left: 0;
  padding-right: 0;

  .el-input__inner {
    height: 40px !important;
  }

  ::v-deep .el-form-item {
    width: 100%;
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

  /* Input icon adjustments if needed */
  .el-input_icon.el-range_icon.el-icon-date {
    width: 200px !important;
    background: #00afff !important;
  }
}
.form-bottom{
    width: 100%;
    margin-top: 20%;
}
.bottom-btns{
    width: 100%;
    display: flex;
    justify-content: center;
}
.purple{
    width: 100px;
    background-color: #169BD5;
    color: #ffffff;
}
</style>