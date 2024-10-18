<template>
  <v-card flat height="100vh">
    <div class="grid">
      <div class="image-reader">
        <!-- <v-img
          :aspect-ratio="1"
          class="bg-white"
          :src="allImages[0].url"
          cover
        /> -->
        <swiper
          :modules="modules"
          :slides-per-view="1"
          :space-between="50"
          navigation
          pagination
          @swiper="onSwiper"
          @slideChange="onSlideChange"
        >
          <swiper-slide v-for="(image, index) in allImages" :key="index">
            <v-img :aspect-ratio="1" class="swiper-img" cover :src="image" />
          </swiper-slide>
        </swiper>
      </div>
      <div class="image-no">
        <basic-reader :item="item"></basic-reader>
      </div>
    </div>
  </v-card>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BasicReader from "./BasicReader.vue";

export default {
  name: "ImageReader",
  props: ["item"],
  components: {
    Swiper,
    SwiperSlide,
    BasicReader,
  },
  data() {
    return {
      modules: [Navigation, Pagination],
    };
  },
  computed: {
    allImages() {
      return this.item.imgs;
    },
  },
  methods: {
    onSwiper(swiper) {
      // console.log(swiper);
    },
    onSlideChange() {
      console.log("slide change");
    },
  },
};
</script>

<style scoped>
.image-no {
  img {
    display: none;
  }
}

.grid {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(30vw, 1fr) 1fr;
}
.image-reader-card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.image-reader {
  max-width: 70vw;
}

.swiper {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 50%;
}

:deep(.swiper-pagination-bullet) {
  background-color: #333;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #007bff;
}
.ovf {
  overflow: auto;
}
</style>
<style>
.swiper-img img {
  max-height: 100%;
  text-align: center;
  margin: 0 a;
}
</style>
