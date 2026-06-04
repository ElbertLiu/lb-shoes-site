<script setup lang="ts">
import { ArrowRight, Building2, Facebook, Globe, MapPin, MessageCircle } from 'lucide-vue-next';
import ClientLayout from '../layouts/ClientLayout.vue';
import { useLanguage } from '../i18n';
import { useToast } from '../composables/useToast';
import { copyTextToClipboard } from '../utils/clipboard';

const { t } = useLanguage();
const { success } = useToast();
const copyToClipboard = async (text: string) => {
  const copied = await copyTextToClipboard(text);
  success(copied ? 'Copied to clipboard' : 'Copy failed, please copy manually');
};
</script>

<template>
  <ClientLayout>
    <div class="flex min-h-[calc(100vh-104px)] flex-col bg-[#f8fafc] md:h-[calc(100vh-104px)] md:flex-row md:overflow-hidden">
      <div class="flex h-64 w-full flex-col justify-center p-4 md:h-full md:w-1/2 md:p-8">
        <div class="relative h-full w-full overflow-hidden rounded-[2rem] shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1768550996860-2d8666f4c0bb?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2600"
            alt="Shoe factory production line"
            class="absolute inset-0 h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#1e293b]/35 to-transparent" />
          <div class="absolute inset-0 bg-gradient-to-r from-[#0f172a]/35 via-transparent to-transparent" />

          <div class="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <span class="mb-6 inline-flex self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {{ t('contact.aboutUs') }}
            </span>
            <h1 class="mb-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl">
              {{ t('contact.subtitle1') }}
            </h1>
            <p class="text-lg font-medium tracking-wide text-blue-200 md:text-2xl">
              {{ t('contact.subtitle2') }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex h-full w-full flex-col justify-center overflow-y-auto px-6 py-10 md:w-1/2 md:p-12">
        <div class="mx-auto w-full max-w-xl">
          <div class="mb-10 text-gray-600">
            <p class="mb-4 text-lg font-medium leading-relaxed text-gray-800 md:text-xl">{{ t('contact.p1') }}</p>
            <p class="text-sm leading-relaxed text-gray-500 md:text-base">{{ t('contact.p2') }}</p>
          </div>

          <div class="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="flex gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                <Building2 class="h-5 w-5" />
              </div>
              <div>
                <h4 class="mb-1 text-sm font-bold text-gray-900">{{ t('contact.feature1Title') }}</h4>
                <p class="text-xs leading-snug text-gray-500">{{ t('contact.feature1Desc') }}</p>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                <Globe class="h-5 w-5" />
              </div>
              <div>
                <h4 class="mb-1 text-sm font-bold text-gray-900">{{ t('contact.feature2Title') }}</h4>
                <p class="text-xs leading-snug text-gray-500">{{ t('contact.feature2Desc') }}</p>
              </div>
            </div>
          </div>

          <div class="mb-10 h-px w-full bg-gray-100" />

          <div class="space-y-4">
            <div class="mb-2 flex flex-col gap-4 sm:flex-row">
              <button class="group flex flex-1 items-center rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:border-green-200 hover:shadow-md" @click="copyToClipboard('+86 138-0000-0000')">
                <div class="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 rtl:ml-4 rtl:mr-0">
                  <MessageCircle class="h-5 w-5" />
                </div>
                <div class="flex-1">
                  <div class="text-xs font-semibold text-gray-400">WhatsApp</div>
                  <div class="text-sm font-bold text-gray-900">+86 138-0000-0000</div>
                </div>
                <ArrowRight class="h-4 w-4 text-gray-300 group-hover:text-green-500" />
              </button>

              <button class="group flex flex-1 items-center rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:border-blue-200 hover:shadow-md" @click="copyToClipboard('Facebook: ShoeFactory_Official')">
                <div class="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 rtl:ml-4 rtl:mr-0">
                  <Facebook class="h-5 w-5" />
                </div>
                <div class="flex-1">
                  <div class="text-xs font-semibold text-gray-400">Facebook</div>
                  <div class="text-sm font-bold text-gray-900">@ShoeFactory</div>
                </div>
                <ArrowRight class="h-4 w-4 text-gray-300 group-hover:text-blue-500" />
              </button>
            </div>

            <div class="flex items-center rounded-2xl border border-gray-100/50 bg-gray-50 p-4">
              <div class="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm rtl:ml-4 rtl:mr-0">
                <MapPin class="h-5 w-5" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-gray-900">{{ t('contact.addressTitle') }}</h4>
                <p class="mt-0.5 text-xs text-gray-500">{{ t('contact.addressDesc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientLayout>
</template>
