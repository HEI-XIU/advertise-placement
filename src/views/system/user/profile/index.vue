<template>
  <div class="app-container">
    <el-card>
      <template v-slot:header>
        <div class="clearfix">
          <span>修改密码</span>
        </div>
      </template>
      <resetPwd />
    </el-card>
  </div>
</template>

<script setup name="Profile">
import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";

const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {},
});

function getUser() {
  getUserProfile().then((response) => {
    state.user = response.data;
    state.roleGroup = response.roleGroup;
    state.postGroup = response.postGroup;
  });
}

getUser();
</script>
