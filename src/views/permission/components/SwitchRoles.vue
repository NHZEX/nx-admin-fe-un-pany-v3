<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"

const userStore = useUserStore()
</script>

<template>
  <div>
    <div>你的权限：{{ userStore.userTypeDesc }}</div>
  </div>
</template>

<style lang="scss" scoped>
.switch-roles {
  margin-top: 15px;
  display: flex;
  align-items: center;
}
</style>
