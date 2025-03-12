<template>
  <div class="grid">
    <div>
      <div class="podcat-reader">
        <div class="warp">
          <div class="glass">
            <v-img
              :src="item.thumbnail || item.feed?.icon || ''"
              cover
              max-height="300px"
              max-width="300px"
              class="d-flex align-center mx-auto rounded-lg"
            >
              <div class="d-flex justify-center">
                <!-- 播放暂停按钮 -->
                <v-btn
                  @click="togglePlay"
                  :icon="curretIsPlaying ? 'mdi-pause' : 'mdi-play'"
                  theme="dark"
                  style="opacity: 0.7"
                >
                </v-btn>
              </div>
            </v-img>
          </div>
        </div>
      </div>
    </div>
    <div>
      <basic-reader :item="item" :reader-ref="readerRef"></basic-reader>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BasicReader from "./BasicReader.vue";
import { FeedItem } from "@/service/types";
import { usePlayListStore } from "@/store/playlist";
import { computed, onMounted, onUnmounted, watch, nextTick } from "vue";

const props = defineProps<{
  readonly item: FeedItem;
  readonly readerRef: HTMLElement | undefined;
}>();
const store = usePlayListStore();

const curretIsPlaying = computed(() =>
  store.currentPlaying?.id == props.item.id ? store.isPlaying : false
);

function togglePlay() {
  const item = props.item;
  if (store.currentPlaying?.id == item.id) {
    store.togglePlaying();
  } else {
    store.play({
      id: item.id,
      url: item.enclosure,
      thumbil: item.thumbnail || item.feed?.icon || "",
      title: item.title,
      subtitle: item.feed?.title || "",
      feedId: item.feedId,
      currentTime: 1000,
    });
  }
}

let aList: Element[] = [];
onMounted(() => {
  if (props.readerRef) {
    aList = Array.from(props.readerRef.querySelectorAll(".content a")).filter(
      (a) => isTimeStr(a.textContent || "")
    );
  }

  addClass(aList);
  aList.forEach((a) => {
    a.addEventListener("click", aclick);
  });
});
onUnmounted(() => {
  aList.forEach((a) => {
    a.removeEventListener("click", aclick);
  });
});

watch(
  () => props.item.id,
  () => {
    nextTick(() => {
      aList.forEach((a) => {
        a.removeEventListener("click", aclick);
      });
      if (props.readerRef) {
        aList = Array.from(
          props.readerRef.querySelectorAll(".content a")
        ).filter((a) => isTimeStr(a.textContent || ""));
      }
      addClass(aList);
      aList.forEach((a) => {
        a.addEventListener("click", aclick);
      });
    });
  }
);

function aclick(e: Event) {
  if (
    e.target instanceof HTMLAnchorElement &&
    e.target.textContent?.includes(":")
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (store.currentPlaying?.id == props.item.id) {
      store.setCurrentTime(time2seconds(e.target.textContent || "00:00:00"));
    }
  }
}

function isTimeStr(str: string) {
  // Matches formats like "HH:MM" (24-hour) or "HH:MM:SS"
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
  return timeRegex.test(str);
}

function time2seconds(time: string) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function addClass(list: Element[]) {
  list.forEach((a) => {
    a.classList.add("timestamp");
  });
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: minmax(20vw, 1fr) 2fr;
}
.podcat-reader {
  width: 100%;
  position: sticky;
  top: calc(56px + 16px);
  padding: 1rem;
  .warp {
    height: calc(100vh - 56px - 5rem);
    border-radius: 1rem;
    background: linear-gradient(
      to right bottom,
      rgba(var(--v-theme-primary), 0.6),
      rgba(var(--v-theme-primary), 1)
    );
  }
  .glass {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 20px;
    color: white;
    font-size: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 1rem;
    backdrop-filter: blur(10px); /* 模糊效果 */
    -webkit-backdrop-filter: blur(10px);
  }
  .v-card {
    margin: 0 auto;
    background-color: transparent;
  }
}
@media (max-width: 760px) {
  .grid {
    grid-template-columns: 1fr;
    .warp {
      height: 30vh;
    }
  }
}
</style>
<style lang="css">
.timestamp::before {
  content: " ";
  height: 1rem;
  width: 1rem;
  display: inline-flex;
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 50%;
  /* box-sizing: border-box; */
  margin-right: 0.5rem;
}
</style>
