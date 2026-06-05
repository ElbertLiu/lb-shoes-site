<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Delete, Edit, Plus, Rank, RefreshLeft, Search, Upload, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminLayout from '../../layouts/AdminLayout.vue';
import { languageOptions } from '../../i18n';
import { useCategories } from '../../stores/categories';
import { useProducts } from '../../stores/products';
import { getAuthHeaders, logout } from '../../stores/auth';
import type { Product } from '../../types';
import { API_BASE_URL, resolveMediaUrl } from '../../utils/api';
import { IMAGE_TARGET_BYTES, MAX_PRODUCT_IMAGES, prepareImageForUpload } from '../../utils/imageCompression';
import { cleanTranslations } from '../../utils/translation';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
const { categories, getCategoryName } = useCategories();
const { products: productList, setProducts } = useProducts();

const showForm = ref(false);
const showPreview = ref(false);
const keyword = ref('');
const categoryFilter = ref('');
const stockFilter = ref('');
const featuredFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedProducts = ref<Product[]>([]);
const previewProduct = ref<Product | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const formRef = ref();
const uploadingImages = ref(false);
const uploadingColorIndex = ref<number | null>(null);
const uploadStatus = ref('');
const draggingImageIndex = ref<number | null>(null);
const dragOverImageIndex = ref<number | null>(null);
const formData = reactive<Product>({
  id: '',
  name: '',
  brief: '',
  briefTranslations: {},
  price: '',
  category: categories.value[0]?.id || '',
  inStock: true,
  featured: false,
  images: [''],
  colorOptions: [],
});

const filteredProducts = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return productList.value.filter((product) => {
    const matchesKeyword = !q
      || product.id.toLowerCase().includes(q)
      || product.name.toLowerCase().includes(q)
      || product.brief.toLowerCase().includes(q);
    const matchesCategory = !categoryFilter.value || product.category === categoryFilter.value;
    const matchesStock = stockFilter.value === ''
      || (stockFilter.value === 'inStock' ? product.inStock : !product.inStock);
    const matchesFeatured = featuredFilter.value === ''
      || (featuredFilter.value === 'featured' ? product.featured : !product.featured);
    return matchesKeyword && matchesCategory && matchesStock && matchesFeatured;
  });
});
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredProducts.value.slice(start, start + pageSize.value);
});
const isEditing = computed(() => productList.value.some((product) => product.id === formData.id));
const selectedIds = computed(() => selectedProducts.value.map((product) => product.id));
const stats = computed(() => ({
  total: productList.value.length,
  inStock: productList.value.filter((product) => product.inStock).length,
  madeToOrder: productList.value.filter((product) => !product.inStock).length,
  featured: productList.value.filter((product) => product.featured).length,
}));
const rules = {
  id: [{ required: true, message: '请填写货号', trigger: 'blur' }],
  name: [{ required: true, message: '请填写产品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请填写参考价格', trigger: 'blur' }],
};

watch([keyword, categoryFilter, stockFilter, featuredFilter, pageSize], () => {
  currentPage.value = 1;
});

const persistProducts = async (nextProducts: Product[]) => {
  try {
    await setProducts(nextProducts);
  } catch {
    ElMessage.error('保存失败，请确认后端服务已启动');
    throw new Error('Failed to save products');
  }
};
const cleanImages = (images: string[]) => images.map((image) => image.trim()).filter(Boolean);
const translationLanguageOptions = languageOptions.filter((option) => option.code !== 'zh');
const previewImages = (images: string[]) => cleanImages(images).map(resolveMediaUrl);
const firstImage = (images: string[]) => resolveMediaUrl(cleanImages(images)[0] || FALLBACK_IMAGE);
const resetForm = (product?: Product) => {
  Object.assign(formData, product
    ? {
      ...product,
      briefTranslations: { ...(product.briefTranslations || {}) },
      images: product.images.length ? [...product.images.slice(0, MAX_PRODUCT_IMAGES)] : [''],
      colorOptions: product.colorOptions?.map((option) => ({ ...option })) || [],
    }
    : {
      id: '',
      name: '',
      brief: '',
      briefTranslations: {},
      price: '',
      category: categories.value[0]?.id || '',
      inStock: true,
      featured: false,
      images: [''],
      colorOptions: [],
    });
};
const openCreate = () => {
  resetForm();
  showForm.value = true;
};
const openEdit = (product: Product) => {
  resetForm(product);
  showForm.value = true;
};
const openPreview = (product: Product) => {
  previewProduct.value = product;
  showPreview.value = true;
};
const handleDelete = async (id: string) => {
  await ElMessageBox.confirm('确认删除该产品吗？', '提示', { type: 'warning' });
  await persistProducts(productList.value.filter((product) => product.id !== id));
  selectedProducts.value = selectedProducts.value.filter((product) => product.id !== id);
  ElMessage.success('删除成功');
};
const handleBatchDelete = async () => {
  if (!selectedProducts.value.length) {
    ElMessage.warning('请先选择产品');
    return;
  }
  await ElMessageBox.confirm(`确认删除已选的 ${selectedProducts.value.length} 个产品吗？`, '批量删除', { type: 'warning' });
  const ids = new Set(selectedIds.value);
  await persistProducts(productList.value.filter((product) => !ids.has(product.id)));
  selectedProducts.value = [];
  ElMessage.success('批量删除成功');
};
const toggleStock = async (product: Product, value: boolean) => {
  await persistProducts(productList.value.map((item) => item.id === product.id ? { ...item, inStock: value } : item));
  ElMessage.success('状态已更新');
};
const toggleFeatured = async (product: Product, value: boolean) => {
  await persistProducts(productList.value.map((item) => item.id === product.id ? { ...item, featured: value } : item));
  ElMessage.success(value ? '已加入首页精选' : '已移出首页精选');
};
const handleBatchStock = async (value: boolean) => {
  if (!selectedProducts.value.length) {
    ElMessage.warning('请先选择产品');
    return;
  }
  const ids = new Set(selectedIds.value);
  await persistProducts(productList.value.map((product) => ids.has(product.id) ? { ...product, inStock: value } : product));
  ElMessage.success('批量状态已更新');
};
const handleBatchFeatured = async (value: boolean) => {
  if (!selectedProducts.value.length) {
    ElMessage.warning('请先选择产品');
    return;
  }
  const ids = new Set(selectedIds.value);
  await persistProducts(productList.value.map((product) => ids.has(product.id) ? { ...product, featured: value } : product));
  ElMessage.success(value ? '已批量加入首页精选' : '已批量移出首页精选');
};
const handleSubmit = async () => {
  await formRef.value?.validate();
  const images = cleanImages(formData.images).slice(0, MAX_PRODUCT_IMAGES);
  if (formData.colorOptions.some((option) => !option.thumbnail.trim())) {
    ElMessage.error('每个颜色都必须上传缩略图');
    return;
  }

  const saved: Product = {
    id: formData.id.trim(),
    name: formData.name.trim(),
    brief: formData.brief.trim(),
    price: formData.price.trim(),
    category: formData.category,
    inStock: formData.inStock,
    featured: formData.featured,
    images: images.length ? images : [FALLBACK_IMAGE],
    briefTranslations: cleanTranslations(formData.briefTranslations),
    colorOptions: formData.colorOptions
      .map((option, index) => ({ name: `c${index + 1}`, thumbnail: option.thumbnail.trim() }))
      .filter((option) => option.thumbnail),
  };

  const duplicate = productList.value.some((product) => product.id === saved.id && !isEditing.value);
  if (duplicate) {
    ElMessage.error('货号已存在');
    return;
  }

  await persistProducts(isEditing.value
    ? productList.value.map((product) => product.id === saved.id ? saved : product)
    : [saved, ...productList.value]);
  showForm.value = false;
  ElMessage.success('保存成功');
};
const addImageField = () => {
  if (formData.images.length >= MAX_PRODUCT_IMAGES) {
    ElMessage.warning(`最多只能添加 ${MAX_PRODUCT_IMAGES} 张产品图片`);
    return;
  }
  formData.images.push('');
};
const addColorOption = () => {
  formData.colorOptions.push({ name: `c${formData.colorOptions.length + 1}`, thumbnail: '' });
};
const removeColorOption = (index: number) => {
  formData.colorOptions.splice(index, 1);
  formData.colorOptions.forEach((option, optionIndex) => {
    option.name = `c${optionIndex + 1}`;
  });
};
const removeImageField = (index: number) => {
  if (formData.images.length === 1) {
    formData.images[0] = '';
    return;
  }
  formData.images.splice(index, 1);
};
const moveImageField = (fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= formData.images.length || toIndex >= formData.images.length) {
    return;
  }
  const [movedImage] = formData.images.splice(fromIndex, 1);
  formData.images.splice(toIndex, 0, movedImage);
  draggingImageIndex.value = toIndex;
  dragOverImageIndex.value = toIndex;
};
const handleImageDragStart = (event: DragEvent, index: number) => {
  draggingImageIndex.value = index;
  dragOverImageIndex.value = index;
  event.dataTransfer?.setData('text/plain', String(index));
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
};
const handleImageDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  const fromIndex = draggingImageIndex.value;
  if (fromIndex === null) {
    return;
  }
  moveImageField(fromIndex, index);
};
const handleImageDragEnd = () => {
  draggingImageIndex.value = null;
  dragOverImageIndex.value = null;
};
const uploadLocalImages = async (files: File[]) => {
  if (!files.length) {
    return;
  }
  const existingImages = cleanImages(formData.images);
  const remainingSlots = MAX_PRODUCT_IMAGES - existingImages.length;
  if (remainingSlots <= 0) {
    ElMessage.warning(`最多只能上传 ${MAX_PRODUCT_IMAGES} 张产品图片`);
    return;
  }
  if (files.length > remainingSlots) {
    ElMessage.warning(`最多只能上传 ${MAX_PRODUCT_IMAGES} 张产品图片，当前还可上传 ${remainingSlots} 张`);
    return;
  }

  uploadingImages.value = true;
  uploadStatus.value = '正在处理图片，请稍等...';
  try {
    const uploadPayload = new FormData();
    let originalCount = 0;
    let compressedCount = 0;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        throw new Error('只能上传图片文件');
      }
      if (file.size > IMAGE_TARGET_BYTES) {
        uploadStatus.value = '正在压缩图片，请稍等...';
      }
      const preparedImage = await prepareImageForUpload(file);
      uploadPayload.append('images', preparedImage.file);
      if (preparedImage.compressed) {
        compressedCount += 1;
      } else {
        originalCount += 1;
      }
    }

    uploadStatus.value = '正在上传图片，请稍等...';
    const response = await fetch(`${API_BASE_URL}/uploads/images`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: uploadPayload,
    });
    const data = await response.json() as { files?: { path?: string }[]; error?: string };
    if (response.status === 401) {
      logout();
      throw new Error('登录已过期，请重新登录');
    }
    if (!response.ok || !Array.isArray(data.files)) {
      throw new Error(data.error || '图片上传失败');
    }

    const uploadedPaths = data.files.map((file) => file.path).filter((path): path is string => Boolean(path));
    const nextImages = [...cleanImages(formData.images), ...uploadedPaths].slice(0, MAX_PRODUCT_IMAGES);
    formData.images.splice(0, formData.images.length, ...(nextImages.length ? nextImages : ['']));
    const messageParts = [
      originalCount ? `原图上传 ${originalCount} 张` : '',
      compressedCount ? `压缩上传 ${compressedCount} 张` : '',
    ].filter(Boolean);
    ElMessage.success(messageParts.length ? messageParts.join('，') : `已上传 ${uploadedPaths.length} 张图片`);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '图片上传失败');
  } finally {
    uploadingImages.value = false;
    uploadStatus.value = '';
  }
};
const uploadColorThumbnail = async (file: File, index: number) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件');
    return;
  }

  uploadingColorIndex.value = index;
  try {
    const preparedImage = await prepareImageForUpload(file);
    const uploadPayload = new FormData();
    uploadPayload.append('images', preparedImage.file);
    const response = await fetch(`${API_BASE_URL}/uploads/images`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: uploadPayload,
    });
    const data = await response.json() as { files?: { path?: string }[]; error?: string };
    if (response.status === 401) {
      logout();
      throw new Error('登录已过期，请重新登录');
    }
    if (!response.ok || !Array.isArray(data.files) || !data.files[0]?.path) {
      throw new Error(data.error || '缩略图上传失败');
    }
    formData.colorOptions[index].thumbnail = data.files[0].path;
    ElMessage.success('颜色缩略图已上传');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '缩略图上传失败');
  } finally {
    uploadingColorIndex.value = null;
  }
};
const handleColorThumbnailChange = async (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  const [file] = Array.from(input.files || []);
  if (file) {
    await uploadColorThumbnail(file, index);
  }
  input.value = '';
};
const handleImageInputChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  await uploadLocalImages(Array.from(input.files || []));
  input.value = '';
};
const resetFilters = () => {
  keyword.value = '';
  categoryFilter.value = '';
  stockFilter.value = '';
  featuredFilter.value = '';
};
const handleSelectionChange = (rows: Product[]) => {
  selectedProducts.value = rows;
};
</script>

<template>
  <AdminLayout>
    <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      <el-card shadow="never"><el-statistic title="产品总数" :value="stats.total" /></el-card>
      <el-card shadow="never"><el-statistic title="现货产品" :value="stats.inStock" /></el-card>
      <el-card shadow="never"><el-statistic title="定做产品" :value="stats.madeToOrder" /></el-card>
      <el-card shadow="never"><el-statistic title="首页精选" :value="stats.featured" /></el-card>
    </div>

    <el-card shadow="never" class="admin-card">
      <template #header>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <span class="font-medium text-[#303133]">产品管理</span>
            <div class="flex flex-wrap gap-2">
              <el-button :icon="RefreshLeft" @click="resetFilters">重置筛选</el-button>
              <el-button type="primary" :icon="Plus" @click="openCreate">新增产品</el-button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,1fr)_180px_150px_160px]">
            <el-input v-model="keyword" placeholder="搜索产品名称、货号或简介" clearable>
              <template #suffix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="categoryFilter" placeholder="全部分类" clearable>
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
            <el-select v-model="stockFilter" placeholder="全部状态" clearable>
              <el-option label="现货" value="inStock" />
              <el-option label="定做" value="madeToOrder" />
            </el-select>
            <el-select v-model="featuredFilter" placeholder="首页筛选" clearable>
              <el-option label="首页精选" value="featured" />
              <el-option label="未精选" value="notFeatured" />
            </el-select>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-[#909399]">已选 {{ selectedProducts.length }} 项</span>
            <el-button size="small" @click="handleBatchStock(true)">批量设为现货</el-button>
            <el-button size="small" @click="handleBatchStock(false)">批量设为定做</el-button>
            <el-button size="small" type="primary" @click="handleBatchFeatured(true)">加入首页精选</el-button>
            <el-button size="small" @click="handleBatchFeatured(false)">移出首页精选</el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleBatchDelete">批量删除</el-button>
          </div>
        </div>
      </template>

      <el-table :data="paginatedProducts" stripe class="w-full" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="46" />
        <el-table-column label="首图" width="88">
          <template #default="{ row }">
            <el-image :src="firstImage(row.images)" :preview-src-list="previewImages(row.images)" fit="cover" class="h-12 w-12 rounded bg-[#ebeef5]" />
          </template>
        </el-table-column>
        <el-table-column prop="id" label="货号" min-width="130" sortable />
        <el-table-column prop="name" label="名称" min-width="170" show-overflow-tooltip />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">{{ getCategoryName(row.category) }}</template>
        </el-table-column>
        <el-table-column prop="price" label="价格" min-width="150" />
        <el-table-column label="颜色" min-width="160">
          <template #default="{ row }">
            <div v-if="row.colorOptions?.length" class="flex flex-wrap gap-1">
              <el-tag v-for="color in row.colorOptions" :key="`${row.id}-${color.name}`" size="small" effect="plain">
                {{ color.name }}
              </el-tag>
            </div>
            <span v-else class="text-[#909399]">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="brief" label="简介" min-width="150" show-overflow-tooltip />
        <el-table-column label="首页精选" width="110">
          <template #default="{ row }">
            <el-switch
              :model-value="row.featured"
              active-text="是"
              inactive-text="否"
              inline-prompt
              @change="(value) => toggleFeatured(row, Boolean(value))"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-switch
              :model-value="row.inStock"
              active-text="现货"
              inactive-text="定做"
              inline-prompt
              @change="(value) => toggleStock(row, Boolean(value))"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" :icon="View" @click="openPreview(row)">预览</el-button>
            <el-button text type="primary" :icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-button text type="danger" :icon="Delete" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <span class="text-sm text-[#606266]">共 {{ filteredProducts.length }} 条，当前显示 {{ paginatedProducts.length }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredProducts.length"
          layout="sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <el-dialog v-model="showForm" :title="isEditing ? '编辑产品' : '新增产品'" width="760px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="92px">
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <el-form-item label="货号" prop="id">
            <el-input v-model="formData.id" placeholder="例如: SHOE-10020" :disabled="isEditing" />
          </el-form-item>
          <el-form-item label="产品名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入名称" />
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select v-model="formData.category" class="w-full" placeholder="请选择分类">
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="参考价格" prop="price">
            <el-input v-model="formData.price" placeholder="例如: $15.00 - $30.00" />
          </el-form-item>
        </div>

        <el-form-item label="产品简介">
          <el-input v-model="formData.brief" type="textarea" :rows="3" placeholder="简短的产品介绍" />
        </el-form-item>
        <el-form-item label="多语言简介">
          <div class="flex w-full flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs text-[#909399]">留空时官网会显示中文简介</span>
            </div>
            <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
              <el-input
                v-for="option in translationLanguageOptions"
                :key="option.code"
                v-model="formData.briefTranslations![option.code]"
                type="textarea"
                :rows="2"
                :placeholder="`${option.flag} ${option.name}`"
              >
                <template #prepend>{{ option.code.toUpperCase() }}</template>
              </el-input>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="现货状态">
          <el-radio-group v-model="formData.inStock">
            <el-radio :value="true">现货充足</el-radio>
            <el-radio :value="false">需定做</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="首页精选">
          <el-switch v-model="formData.featured" active-text="展示在官网首页" inactive-text="不展示" />
        </el-form-item>
        <el-form-item label="颜色缩略图">
          <div class="flex w-full flex-col gap-3">
            <div
              v-for="(color, index) in formData.colorOptions"
              :key="index"
              class="grid grid-cols-1 gap-2 rounded-lg border border-[#ebeef5] p-3 md:grid-cols-[64px_1fr_auto]"
            >
              <div class="flex h-10 items-center justify-center rounded border border-[#dcdfe6] bg-[#f5f7fa] text-sm font-medium text-[#606266]">
                c{{ index + 1 }}
              </div>
              <div class="flex min-w-0 items-center gap-2">
                <div class="h-12 w-12 shrink-0 overflow-hidden rounded border border-[#dcdfe6] bg-[#f5f7fa]">
                  <el-image v-if="color.thumbnail" :src="resolveMediaUrl(color.thumbnail)" fit="cover" class="h-full w-full" />
                </div>
                <el-input v-model="color.thumbnail" placeholder="上传后自动生成缩略图地址" readonly />
              </div>
              <div class="flex items-center gap-2">
                <el-button size="small" :icon="Upload" :loading="uploadingColorIndex === index" class="relative overflow-hidden">
                  上传缩略图
                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 cursor-pointer opacity-0"
                    @change="handleColorThumbnailChange($event, index)"
                  />
                </el-button>
                <el-button size="small" :icon="Delete" @click="removeColorOption(index)" />
              </div>
            </div>
            <el-button :icon="Plus" @click="addColorOption">添加颜色</el-button>
            <p class="text-xs text-[#909399]">新增颜色会自动编号为 c1、c2，以此类推；每个颜色都必须上传缩略图，前台只显示缩略图做快速颜色预览。</p>
          </div>
        </el-form-item>
        <el-form-item label="产品图片">
          <div class="flex w-full flex-col gap-3">
            <div
              v-for="(_, index) in formData.images"
              :key="index"
              class="flex items-center gap-2 rounded-lg border border-transparent p-1 transition-colors"
              :class="dragOverImageIndex === index ? 'border-[#409eff] bg-[#ecf5ff]' : 'hover:bg-[#f5f7fa]'"
              @dragover="handleImageDragOver($event, index)"
              @drop.prevent="handleImageDragEnd"
            >
              <button
                type="button"
                class="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded border border-[#dcdfe6] bg-white text-[#909399] transition-colors hover:border-[#409eff] hover:text-[#409eff] active:cursor-grabbing"
                draggable="true"
                title="拖拽调整图片顺序"
                @dragstart="handleImageDragStart($event, index)"
                @dragend="handleImageDragEnd"
              >
                <el-icon><Rank /></el-icon>
              </button>
              <el-input v-model="formData.images[index]" placeholder="可填写外链 URL，或上传本地图片后自动生成" />
              <el-tag v-if="index === 0" type="success" effect="plain">首图</el-tag>
              <el-button :icon="Delete" @click="removeImageField(index)" />
            </div>
            <div class="flex flex-wrap gap-2">
              <el-button :icon="Plus" :disabled="formData.images.length >= MAX_PRODUCT_IMAGES || uploadingImages" @click="addImageField">添加图片 URL</el-button>
              <el-button type="primary" :icon="Upload" :loading="uploadingImages" :disabled="cleanImages(formData.images).length >= MAX_PRODUCT_IMAGES" @click="fileInputRef?.click()">上传本地图片</el-button>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleImageInputChange"
              />
            </div>
            <p v-if="uploadStatus" class="text-sm text-[#409eff]">{{ uploadStatus }}</p>
            <p class="text-xs text-[#909399]">最多上传 {{ MAX_PRODUCT_IMAGES }} 张图片；500KB 以内原图上传，超过 500KB 会压缩到约 500KB。</p>
            <div v-if="cleanImages(formData.images).length" class="flex flex-wrap gap-2">
              <div
                v-for="(image, index) in cleanImages(formData.images)"
                :key="image"
                class="relative h-16 w-16 overflow-hidden rounded border border-[#ebeef5]"
              >
                <el-image
                  :src="resolveMediaUrl(image)"
                  :preview-src-list="previewImages(formData.images)"
                  fit="cover"
                  class="h-full w-full"
                />
                <span v-if="index === 0" class="absolute left-1 top-1 rounded bg-[#67c23a] px-1.5 py-0.5 text-[10px] font-medium text-white">首图</span>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPreview" title="产品预览" width="620px">
      <div v-if="previewProduct" class="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr]">
        <el-image :src="firstImage(previewProduct.images)" :preview-src-list="previewImages(previewProduct.images)" fit="cover" class="h-44 w-full rounded bg-[#ebeef5]" />
        <div class="space-y-3 text-sm text-[#606266]">
          <h3 class="text-lg font-semibold text-[#303133]">{{ previewProduct.name }}</h3>
          <p><span class="text-[#909399]">货号：</span>{{ previewProduct.id }}</p>
          <p><span class="text-[#909399]">分类：</span>{{ getCategoryName(previewProduct.category) }}</p>
          <p><span class="text-[#909399]">价格：</span>{{ previewProduct.price }}</p>
          <p><span class="text-[#909399]">状态：</span>{{ previewProduct.inStock ? '现货' : '定做' }}</p>
          <p><span class="text-[#909399]">首页精选：</span>{{ previewProduct.featured ? '是' : '否' }}</p>
          <p><span class="text-[#909399]">简介：</span>{{ previewProduct.brief || '--' }}</p>
          <p><span class="text-[#909399]">简介翻译：</span>{{ Object.keys(previewProduct.briefTranslations || {}).length }} 种语言</p>
          <div>
            <span class="text-[#909399]">颜色：</span>
            <div v-if="previewProduct.colorOptions?.length" class="mt-2 flex flex-wrap gap-2">
              <div v-for="(color, index) in previewProduct.colorOptions" :key="`${color.thumbnail}-${index}`" class="rounded border border-[#ebeef5] p-1">
                <el-image :src="resolveMediaUrl(color.thumbnail)" fit="cover" class="h-8 w-8 rounded bg-[#f5f7fa]" />
              </div>
            </div>
            <span v-else>--</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </AdminLayout>
</template>
