<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Delete, Edit, Plus, RefreshLeft, Search, Upload, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AdminLayout from '../../layouts/AdminLayout.vue';
import { useCategories } from '../../stores/categories';
import { useProducts } from '../../stores/products';
import type { Product } from '../../types';
import { API_BASE_URL, resolveMediaUrl } from '../../utils/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
const MAX_IMAGE_SIDE = 1600;
const TARGET_IMAGE_BYTES = 720 * 1024;
const INITIAL_IMAGE_QUALITY = 0.82;
const MIN_IMAGE_QUALITY = 0.56;
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
const formData = reactive<Product>({
  id: '',
  name: '',
  brief: '',
  price: '',
  category: categories.value[0]?.id || '',
  inStock: true,
  featured: false,
  images: [''],
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
const previewImages = (images: string[]) => cleanImages(images).map(resolveMediaUrl);
const firstImage = (images: string[]) => resolveMediaUrl(cleanImages(images)[0] || FALLBACK_IMAGE);
const resetForm = (product?: Product) => {
  Object.assign(formData, product
    ? { ...product, images: product.images.length ? [...product.images] : [''] }
    : {
      id: '',
      name: '',
      brief: '',
      price: '',
      category: categories.value[0]?.id || '',
      inStock: true,
      featured: false,
      images: [''],
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
  const images = cleanImages(formData.images);
  const saved: Product = {
    id: formData.id.trim(),
    name: formData.name.trim(),
    brief: formData.brief.trim(),
    price: formData.price.trim(),
    category: formData.category,
    inStock: formData.inStock,
    featured: formData.featured,
    images: images.length ? images : [FALLBACK_IMAGE],
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
const addImageField = () => formData.images.push('');
const removeImageField = (index: number) => {
  if (formData.images.length === 1) {
    formData.images[0] = '';
    return;
  }
  formData.images.splice(index, 1);
};
const loadImage = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('图片读取失败'));
  };
  image.src = objectUrl;
});
const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) {
      resolve(blob);
      return;
    }
    reject(new Error('图片压缩失败'));
  }, type, quality);
});
const compressImage = async (file: File) => {
  const image = await loadImage(file);
  const ratio = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('浏览器不支持图片压缩');
  }
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let quality = INITIAL_IMAGE_QUALITY;
  let blob = await canvasToBlob(canvas, 'image/webp', quality);
  while (blob.size > TARGET_IMAGE_BYTES && quality > MIN_IMAGE_QUALITY) {
    quality = Math.max(MIN_IMAGE_QUALITY, quality - 0.08);
    blob = await canvasToBlob(canvas, 'image/webp', quality);
  }

  const filename = file.name.replace(/\.[^.]+$/, '') || 'product-image';
  return new File([blob], `${filename}.webp`, { type: 'image/webp' });
};
const uploadLocalImages = async (files: File[]) => {
  if (!files.length) {
    return;
  }
  uploadingImages.value = true;
  try {
    const uploadPayload = new FormData();
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        throw new Error('只能上传图片文件');
      }
      uploadPayload.append('images', await compressImage(file));
    }

    const response = await fetch(`${API_BASE_URL}/uploads/images`, {
      method: 'POST',
      body: uploadPayload,
    });
    const data = await response.json() as { files?: { path?: string }[]; error?: string };
    if (!response.ok || !Array.isArray(data.files)) {
      throw new Error(data.error || '图片上传失败');
    }

    const uploadedPaths = data.files.map((file) => file.path).filter((path): path is string => Boolean(path));
    const nextImages = [...cleanImages(formData.images), ...uploadedPaths];
    formData.images.splice(0, formData.images.length, ...(nextImages.length ? nextImages : ['']));
    ElMessage.success(`已压缩并上传 ${uploadedPaths.length} 张图片`);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '图片上传失败');
  } finally {
    uploadingImages.value = false;
  }
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
        <el-form-item label="现货状态">
          <el-radio-group v-model="formData.inStock">
            <el-radio :value="true">现货充足</el-radio>
            <el-radio :value="false">需定做</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="首页精选">
          <el-switch v-model="formData.featured" active-text="展示在官网首页" inactive-text="不展示" />
        </el-form-item>
        <el-form-item label="产品图片">
          <div class="flex w-full flex-col gap-3">
            <div v-for="(_, index) in formData.images" :key="index" class="flex items-center gap-2">
              <el-input v-model="formData.images[index]" placeholder="可填写外链 URL，或上传本地图片后自动生成" />
              <el-button :icon="Delete" @click="removeImageField(index)" />
            </div>
            <div class="flex flex-wrap gap-2">
              <el-button :icon="Plus" @click="addImageField">添加图片 URL</el-button>
              <el-button type="primary" :icon="Upload" :loading="uploadingImages" @click="fileInputRef?.click()">上传本地图片</el-button>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleImageInputChange"
              />
            </div>
            <div v-if="cleanImages(formData.images).length" class="flex flex-wrap gap-2">
              <el-image
                v-for="image in cleanImages(formData.images)"
                :key="image"
                :src="resolveMediaUrl(image)"
                :preview-src-list="previewImages(formData.images)"
                fit="cover"
                class="h-16 w-16 rounded border border-[#ebeef5]"
              />
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
        </div>
      </div>
    </el-dialog>
  </AdminLayout>
</template>
