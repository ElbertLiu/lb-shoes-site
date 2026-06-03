<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Lock, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useAuth } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const { login } = useAuth();
const loading = ref(false);
const form = reactive({
  username: '',
  password: '',
});

const handleLogin = async () => {
  if (!form.username.trim() || !form.password) {
    ElMessage.warning('请输入账号和密码');
    return;
  }

  loading.value = true;
  try {
    await login(form.username, form.password);
    ElMessage.success('登录成功');
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/products';
    router.replace(redirect);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
    <section class="w-full max-w-[420px] rounded-lg border border-[#ebeef5] bg-white p-8 shadow-sm">
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-[#409eff]">ShoeFactory</p>
        <h1 class="mt-2 text-2xl font-bold text-[#303133]">后台登录</h1>
      </div>

      <el-form label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="账号">
          <el-input v-model="form.username" size="large" placeholder="请输入管理员账号">
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" size="large" type="password" show-password placeholder="请输入管理员密码" @keyup.enter="handleLogin">
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-button class="mt-3 w-full" size="large" type="primary" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </section>
  </main>
</template>
