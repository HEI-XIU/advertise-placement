<template>
  <div class="hamburger-box" @click="toggleClick">
    <img
      :class="{ 'is-active': isActive }"
      src="@/assets/images/open.png"
    />
  </div>
</template>

<script>
export default {
  name: 'Hamburger',
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleClick() {
      this.$emit('toggleClick')
    }
  }
}
</script>

<style scoped lang="scss">
.hamburger-box {
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
  color: #fff;
  padding-right: 18px;
}

img {
  width: 28px;
  height: 28px;
  transform: rotate(180deg);

  &.is-active {
    transform: rotate(360deg);
  }
}
</style>
