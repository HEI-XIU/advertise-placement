<template>
  <div class="navbar">
    <!-- <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" /> -->
    <!-- <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" /> -->

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <!-- <el-tooltip content="主题模式" effect="dark" placement="bottom">
          <div
            class="right-menu-item hover-effect theme-switch-wrapper"
            @click="toggleTheme"
          >
            <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
            <svg-icon v-if="!settingsStore.isDark" icon-class="moon" />
          </div>
        </el-tooltip> -->
      </template>
      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        @command="handleCommand" 
      >
        <div class="avatar-wrapper">
          <div class="user-avatar">
            <img :src="userStore.avatar" />
          </div>
          <span class="right-menu-item hover-effect" v-text="userName"></span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided command="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img :src="userStore.avatar" class="user-avatar" />
            <el-icon><caret-bottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                <span>布局设置</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus";
import Breadcrumb from "@/components/Breadcrumb";
import TopNav from "@/components/TopNav";
import Hamburger from "@/components/Hamburger";
import Screenfull from "@/components/Screenfull";
import useAppStore from "@/store/modules/app";
import useUserStore from "@/store/modules/user";
import useSettingsStore from "@/store/modules/settings";

const appStore = useAppStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const userName = userStore.nickName||"用户名";

function toggleSideBar() {
  appStore.toggleSideBar();
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout();
      break;
    case "logout":
      console.log(123)
      logout();
      break;
    default:
      break;
  }
}

function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      userStore.logOut().then(() => {
        // location.href = "/index";
        location.href = '/orderReceive/receiveList';
      });
    })
    .catch(() => {});
}

const emits = defineEmits(["setLayout"]);
function setLayout() {
  emits("setLayout");
}

function toggleTheme() {
  settingsStore.toggleTheme();
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 26px;
  overflow: hidden;
  position: relative;
  background: #e1e5fa;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    padding-right: 10px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 12px;
      color: #465896;
      vertical-align: text-bottom;
      line-height: 60px;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }

      & > .question {
        scale: 1.4;
      }
    }

    .avatar-container {
      .avatar-wrapper {
        display: flex;
        align-items: center;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-image: linear-gradient(to bottom, #d8deff, #465896);
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 12px;
            height: 12px;
          }
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
