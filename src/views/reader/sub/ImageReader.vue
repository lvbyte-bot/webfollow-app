<template>
  <div class="grid">
    <div>
      <div class="image-reader">
        <Swiper
          :modules="modules"
          :space-between="30"
          :slides-per-view="1"
          navigation
          pagination
          @swiper="onSwiper"
          @slideChange="onSlideChange"
          ref="swiperRef"
        >
          <SwiperSlide v-for="(image, index) in allImages" :key="index">
            <img :width="300" :src="image" />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
    <div class="text-reader">
      <basic-reader :item="item" :reader-ref="readerRef"></basic-reader>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { FeedItem } from "@/service/types";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BasicReader from "./BasicReader.vue";

// 定义 props
const props = defineProps<{
  readonly item: FeedItem;
  readonly readerRef: HTMLElement | undefined;
}>();

// 定义 emits（如果需要的话）
const emit = defineEmits();

// 定义数据
const modules = [Navigation, Pagination];
const swiper = ref<any>({});

// 计算属性
const allImages = computed(() => {
  return props.item.images;
});

// 监听器
watch(
  () => props.item,
  () => {
    swiper.value.slideTo(0);
  }
);

// 方法
const onSwiper = (swiperInstance: any) => {
  swiper.value = swiperInstance;
};

const onSlideChange = (_: any) => {};
</script>

<style scoped>
.grid {
  height: 100%;
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: minmax(20vw, 6fr) minmax(15vw, 2fr);
  background: rgb(var(--v-theme-background));
}

.image-reader-card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.image-reader {
  position: sticky;
  top: calc(56px + 16px);
}

.swiper {
  border-radius: 8px;
  height: calc(100vh - 56px - 2.5rem);
  padding: 1rem;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  object-fit: cover;
  transition: transform 0.3s ease;
  max-height: 100vh;
  height: auto;
  width: auto;
  display: none;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #fff;
  background-color: rgba(var(--v-theme-surface-variant), 0.6);
  padding: 20px;
  border-radius: 50%;
}

:deep(.swiper-pagination-bullet) {
  background-color: #333;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: rgb(var(--v-theme-primary));
}
.ovf {
  overflow: auto;
}
.swiper-slide-active {
  img {
    display: block;
  }
}

@media (max-width: 1200px) {
  .grid {
    display: block;
  }
  .text-reader {
    margin-top: 2rem;
  }
}
</style>
<style lang="scss">
.text-reader {
  img {
    text-align: center;
    margin: 0 auto;
    max-width: 100%;
    display: none;
  }
  .v-card-title {
    display: none;
  }
  .bar-left {
    width: 10px;
  }
}
@media (max-width: 1200px) {
  .text-reader {
    img {
      display: block;
    }
  }
}
</style>
