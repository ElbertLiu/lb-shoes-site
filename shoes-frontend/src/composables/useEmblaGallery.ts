import { computed, nextTick, ref, watch, type ComputedRef } from 'vue';
import useEmblaCarousel from 'embla-carousel-vue';
import type { EmblaOptionsType } from 'embla-carousel';

type GalleryImagesSource = ComputedRef<string[]>;

export function useEmblaGallery(images: GalleryImagesSource, options: EmblaOptionsType = {}) {
  const currentIndex = ref(0);
  const displayImages = computed(() => images.value.length ? images.value : ['']);
  const hasMultipleImages = computed(() => images.value.length > 1);
  const emblaOptions = computed<EmblaOptionsType>(() => ({
    align: 'center',
    duration: 24,
    loop: hasMultipleImages.value,
    skipSnaps: false,
    ...options,
  }));
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  const syncIndex = () => {
    currentIndex.value = emblaApi.value?.selectedScrollSnap() || 0;
  };

  const scrollTo = (index: number, jump = false) => {
    emblaApi.value?.scrollTo(index, jump);
  };

  const scrollNext = () => {
    emblaApi.value?.scrollNext();
  };

  const scrollPrev = () => {
    emblaApi.value?.scrollPrev();
  };

  const reset = () => {
    currentIndex.value = 0;
    void nextTick().then(() => {
      emblaApi.value?.reInit();
      emblaApi.value?.scrollTo(0, true);
      syncIndex();
    });
  };

  watch(images, reset, { immediate: true });

  watch(emblaApi, (api, _previousApi, onCleanup) => {
    if (!api) return;
    api
      .on('select', syncIndex)
      .on('reInit', syncIndex);
    syncIndex();
    onCleanup(() => {
      api
        .off('select', syncIndex)
        .off('reInit', syncIndex);
    });
  });

  return {
    currentIndex,
    displayImages,
    emblaRef,
    emblaApi,
    hasMultipleImages,
    reset,
    scrollNext,
    scrollPrev,
    scrollTo,
    syncIndex,
  };
}
