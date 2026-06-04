import { createApp } from 'vue';
import {
  ElAside,
  ElAvatar,
  ElButton,
  ElCard,
  ElContainer,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElHeader,
  ElIcon,
  ElImage,
  ElInput,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElOption,
  ElPagination,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElStatistic,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import { router } from './router';
import './index.css';

const app = createApp(App).use(router);

[
  ElAside,
  ElAvatar,
  ElButton,
  ElCard,
  ElContainer,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElHeader,
  ElIcon,
  ElImage,
  ElInput,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElOption,
  ElPagination,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElStatistic,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
].forEach((component) => {
  app.use(component);
});

app.mount('#root');
