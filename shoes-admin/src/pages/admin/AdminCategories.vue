<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminLayout from '../../layouts/AdminLayout.vue';
import { useCategories } from '../../stores/categories';
import { useProducts } from '../../stores/products';
import type { Category } from '../../types';

const { categories: categoryList, setCategories } = useCategories();
const { products } = useProducts();
const showForm = ref(false);
const keyword = ref('');
const formRef = ref();
const formData = reactive<Partial<Category>>({ id: '', name: '' });
const isEditing = computed(() => categoryList.value.some((category) => category.id === formData.id));
const filteredCategories = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) {
    return categoryList.value;
  }
  return categoryList.value.filter((category) => category.id.toLowerCase().includes(q) || category.name.toLowerCase().includes(q));
});
const rules = {
  name: [{ required: true, message: '请填写分类名称', trigger: 'blur' }],
};

const productCount = (categoryId: string) => products.value.filter((product) => product.category === categoryId).length;
const resetForm = (category?: Category) => Object.assign(formData, category || { id: '', name: '' });
const openCreate = () => {
  resetForm();
  showForm.value = true;
};
const openEdit = (category: Category) => {
  resetForm(category);
  showForm.value = true;
};
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该分类吗？', '提示', { type: 'warning' });
    await setCategories(categoryList.value.filter((category) => category.id !== id));
    ElMessage.success('删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请确认后端服务已启动');
    }
  }
};
const handleSubmit = async () => {
  await formRef.value?.validate();
  const saved = {
    id: formData.id || `c${Date.now()}`,
    name: formData.name || '',
  };
  const nextCategories = isEditing.value
    ? categoryList.value.map((category) => category.id === saved.id ? saved : category)
    : [...categoryList.value, saved];
  await setCategories(nextCategories);
  showForm.value = false;
  ElMessage.success('保存成功');
};
</script>

<template>
  <AdminLayout>
    <el-card shadow="never" class="admin-card">
      <template #header>
        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <span class="font-medium text-[#303133]">分类管理</span>
          <div class="flex w-full items-center gap-3 md:w-auto">
            <el-input v-model="keyword" class="flex-1 md:w-64" placeholder="请输入分类名称" clearable>
              <template #suffix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button type="primary" :icon="Plus" @click="openCreate">新增分类</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredCategories" stripe>
        <el-table-column prop="id" label="ID" width="120" />
        <el-table-column prop="name" label="分类名称" min-width="180" />
        <el-table-column label="商品数量" width="120">
          <template #default="{ row }">{{ productCount(row.id) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" :icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-button text type="danger" :icon="Delete" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredCategories.length === 0" description="暂无数据" />
      <div class="mt-4 flex justify-end text-sm text-[#606266]">共 {{ filteredCategories.length }} 条</div>
    </el-card>

    <el-dialog v-model="showForm" :title="isEditing ? '编辑分类' : '新增分类'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="88px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </AdminLayout>
</template>
