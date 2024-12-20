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
    <div class="image-no">
      <basic-reader :item="item" :reader-ref="readerRef"></basic-reader>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, Ref } from "vue";
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
  readonly readerRef: Ref<any, any>;
}>();

// 定义 emits（如果需要的话）
const emit = defineEmits();

// 定义数据
const modules = [Navigation, Pagination];
const swiper = ref<any>({});

// 计算属性
const allImages = computed(() => {
  return props.item.imgs;
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
  grid-template-columns: minmax(20vw, 5fr) minmax(15vw, 3fr);
  background: rgb(var(--v-theme-background));
}

.image-reader-card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.image-reader {
  position: sticky;
  top: calc(64px + 16px);
}

.swiper {
  border-radius: 8px;
  height: calc(100vh - 64px - 2.5rem);
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
@media (max-width: 760px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
<style lang="scss">
.image-no {
  img {
    // display: none;
    text-align: center;
    margin: 0 auto;
    width: 80%;
  }
  .v-card-title {
    display: none;
  }
  .bar-left {
    width: 10px;
  }
}
</style>
