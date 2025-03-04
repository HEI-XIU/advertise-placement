<template>
  <div class="upload-file">
    <div class="upload-file-tip">
      <el-upload
        multiple
        action=""
        :http-request="httpRequest"
        :before-upload="handleBeforeUpload"
        :file-list="fileList"
        :limit="limit"
        :on-error="handleUploadError"
        :on-exceed="handleExceed"
        :on-success="handleUploadSuccess"
        :show-file-list="false"
        :headers="headers"
        class="upload-file-uploader"
        ref="fileUpload"
        v-if="showTip"
      >
        <!-- 上传按钮 -->
        <el-button type="primary">选取文件</el-button>
      </el-upload>
      <!-- 上传提示 -->
      <div class="el-upload__tip" v-if="showTip">
        请上传
        <template v-if="fileSize">
          大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
        </template>
        <template v-if="fileType">
          格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
        </template>
        的文件
      </div>
    </div>
    <!-- 文件列表 -->
    <transition-group
      class="upload-file-list el-upload-list el-upload-list--text"
      name="el-fade-in-linear"
      tag="ul"
    >
      <li
        :key="file.uid"
        class="el-upload-list__item ele-upload-list__item-content"
        v-for="(file, index) in fileList"
      >
        <el-link
          :href="`${baseUrl}${file.fileUrl}`"
          :underline="false"
          target="_blank"
        >
          <span class="el-icon-document"> {{ file.fileName }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action" v-if="showTip">
          <el-link :underline="false" @click="handleDelete(index)" type="danger"
            >删除</el-link
          >
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth";
import { uploadFile } from "@/api/orderApi/addOrder";

const props = defineProps({
  modelValue: [String, Object, Array],
  // 数量限制
  limit: {
    type: Number,
    default: 5,
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 50,
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => [
      "doc",
      "xls",
      "ppt",
      "txt",
      "pdf",
      "docx",
      "xlsx",
      "mp3",
      "mp4",
      "png",
      "jpg",
      "jpeg",
    ],
  },
  // 是否显示提示
  isShowTip: {
    type: Boolean,
    default: true,
  },
  fileList: {
    type: Array,
    default: () => [],
  },
});

const { proxy } = getCurrentInstance();
const emit = defineEmits();

const number = ref(0);
const uploadList = ref([]);
const baseUrl = import.meta.env.VITE_APP_BASE_API;
// const uploadFileUrl = ref(
//   import.meta.env.VITE_APP_BASE_API + "/upload/uploadFile"
// ); // 上传文件服务器地址
const headers = ref({ Authorization: "Bearer " + getToken() });
// const fileList = ref([]);
const fileListMsg = ref([]);
const showTip = computed(
  () => props.isShowTip && (props.fileType || props.fileSize)
);

watch(
  () => props.fileList,
  (newVal) => {
    fileListMsg.value = [...newVal];
  },
  { immediate: true, deep: true }
);
// watch(
//   () => props.modelValue,
//   (val) => {
//     if (val) {
//       let temp = 1;
//       // 首先将值转为数组
//       const list = Array.isArray(val) ? val : props.modelValue.split(",");
//       // 然后将数组转为对象数组
//       props.fileList.value = list.map((item) => {
//         if (typeof item === "string") {
//           item = { name: item, url: item };
//         }
//         item.uid = item.uid || new Date().getTime() + temp++;
//         return item;
//       });
//     } else {
//       props.fileList.value = [];
//       return [];
//     }
//   },
//   { deep: true, immediate: true }
// );

function httpRequest(request) {
  let formData = new FormData();
  formData.append("file", request.file);
  uploadFile(formData)
    .then((res) => {
      console.log("fileListMsg1", fileListMsg.value);

      fileListMsg.value.push(res.data);
      console.log("fileListMsg2", fileListMsg.value);
      props.fileList = fileListMsg.value;
      console.log("fileListMsg3", props.fileList);
      emit("updateFileList", fileListMsg.value);
      proxy.$modal.closeLoading();
    })
    .catch((err) => {
      console.log(err);
      proxy.$modal.closeLoading();
    });
}

// 上传前校检格式和大小
function handleBeforeUpload(file) {
  // 校检文件类型
  if (props.fileType.length) {
    const fileName = file.name.split(".");
    const fileExt = fileName[fileName.length - 1];
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0;
    if (!isTypeOk) {
      proxy.$modal.msgError(
        `文件格式不正确，请上传${props.fileType.join("/")}格式文件!`
      );
      return false;
    }
  }
  // 校检文件名是否包含特殊字符
  if (file.name.includes(",")) {
    proxy.$modal.msgError("文件名不正确，不能包含英文逗号!");
    return false;
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }
  proxy.$modal.loading("正在上传文件，请稍候...");
  number.value++;
  return true;
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
}

// 上传失败
function handleUploadError(err) {
  proxy.$modal.msgError("上传文件失败");
}

// 上传成功回调
function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    uploadList.value.push({ name: res.fileName, url: res.fileName });

    uploadedSuccessfully();
  } else {
    number.value--;
    proxy.$modal.closeLoading();
    proxy.$modal.msgError(res.msg);
    proxy.$refs.fileUpload.handleRemove(file);
    uploadedSuccessfully();
  }
}

// 删除文件
function handleDelete(index) {
  props.fileList.splice(index, 1);
  emit("update:modelValue", listToString(props.fileList.value));
}

// 上传结束处理
function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    props.fileList.value = props.fileList.value
      .filter((f) => f.url !== undefined)
      .concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;
    emit("update:modelValue", listToString(props.fileList.value));
    proxy.$modal.closeLoading();
  }
}

// 获取文件名称
function getFileName(name) {
  // console.log(name);
  // 如果是url那么取最后的名字 如果不是直接返回
  // if (name.lastIndexOf("/") > -1) {
  //   return name.slice(name.lastIndexOf("/") + 1);
  // } else {
  //   return name;
  // }
}

// 对象转成指定字符串分隔
function listToString(list, separator) {
  let strs = "";
  separator = separator || ",";
  for (let i in list) {
    if (list[i].url) {
      strs += list[i].url + separator;
    }
  }
  return strs != "" ? strs.substr(0, strs.length - 1) : "";
}
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list {
  margin-top: 0;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
  border: none;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
.upload-file-tip{
  display: flex;
  .el-upload__tip{
    margin: 0 0 0 10px;
  }
}

</style>
