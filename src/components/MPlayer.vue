<template>
  <div
    v-if="calSongInfo.enclosure"
    class="mp-play-track"
    ref="track"
    :style="
      'grid-template-columns: ' +
      size +
      'px auto; grid-column-gap: ' +
      size / 6 +
      'px;'
    "
    v-bind="$attrs"
  >
    <v-img
      class="align-end text-primary"
      :height="size"
      :src="calSongInfo.thumbnail"
      :title="
        (songInfo.link ? '' : calSongInfo.channelName + ' | ') +
        calSongInfo.title
      "
      cover
    >
      <v-btn
        icon
        theme="dark"
        :size="size"
        rounded="0"
        elevation="0"
        @click="play"
        type="text"
      >
        <v-icon :icon="playing ? 'mdi:mdi-pause' : 'mdi:mdi-play'"></v-icon>
      </v-btn>
    </v-img>

    <div class="song-info" v-if="!hiddenInfo">
      <a
        v-if="songInfo.link"
        target="_blank"
        :href="calSongInfo.link"
        :title="calSongInfo.title"
        class="song-title"
        >{{ calSongInfo.title }}</a
      >
      <router-link
        :title="calSongInfo.channelName + ' | ' + calSongInfo.title"
        v-else
        class="song-title"
        :to="'/article/' + calSongInfo.id + '?t=' + currentTime"
      >
        {{ calSongInfo.title }}
      </router-link>

      <small>
        {{ currentTime }} / {{ calSongInfo.itunesDuration || totalTime }}</small
      >
      <v-slider
        :model-value="processWidth"
        :thumb-size="size / 5"
        color="primary"
        @update:modelValue="changePrecent"
      ></v-slider>
      <v-btn
        v-if="!disabledClose"
        icon="mdi:mdi-close"
        class="close"
        size="x-small"
        variant="text"
        @click="close"
      ></v-btn>
    </div>
  </div>
  <audio
    v-if="!songInfo.enclosure"
    :src="calSongInfo.enclosure"
    ref="audio"
    :autoplay="autoplay"
  ></audio>
</template>
<script>
import { watch, ref } from "vue";

// 秒值转字符串
function timeToString(param) {
  function fillZero(str) {
    let realNum;
    if (str < 10) {
      realNum = "0" + str;
    } else {
      realNum = str;
    }
    return realNum;
  }
  param = parseInt(param);
  let hh = "",
    mm = "",
    ss = "";
  if (param >= 0 && param < 60) {
    param < 10 ? (ss = "0" + param) : (ss = param);
    return "00:" + ss;
  } else if (param >= 60 && param < 3600) {
    mm = parseInt(param / 60);
    mm < 10 ? (mm = "0" + mm) : mm;
    param - parseInt(mm * 60) < 10
      ? (ss = "0" + String(param - parseInt(mm * 60)))
      : (ss = param - parseInt(mm * 60));
    return mm + ":" + ss;
  } else if (param >= 3600) {
    hh = parseInt(param / 3600);
    ss = param % 60;
    mm = parseInt((param - ss - hh * 3600) / 60);
    return `${fillZero(hh)}:${fillZero(mm)}:${fillZero(ss)}`;
  }
}
function string2Time(param) {
  let t = param.split(":");
  let s = 0;
  for (let i = 0; i < t.length; i++) {
    let v = t[i];
    if (v.indexOf("0") == 0) {
      v = v.substring(1, v.length);
    }
    let n = Number.parseInt(v);
    s += n * 60 ** (t.length - i - 1);
  }
  return s;
}

export default {
  name: "c-m-player",
  props: {
    songInfo: {
      type: Object,
      default: () => ({}),
    },
    autoplay: Boolean,
    size: {
      type: Number,
      default: () => 88,
    },
    hiddenInfo: Boolean,
    disabledClose: Boolean,
  },
  data() {
    return {
      index: 0, // 当前播放歌曲在列表中的下标
      error: "", // 报错内容
      //播放列表
      songList: [],
    };
  },
  setup(props) {
    const audio = ref();
    // const mplayerStore = useMPlayerStore();
    // const { song, totalTime, currentTime, processWidth, playing, mPlayer } =
    //   storeToRefs(mplayerStore);
    const {
      pushSong,
      clearSongs,
      setCurrentTime,
      setPlaying,
      setMPlayer,
      setProcessWidth,
      setTotalTime,
    } = {};

    //播放与暂停
    function play() {
      console.log("audioPlayer", audio);
      if (audio.value) {
        if (playing.value) {
          // 播放中,点击则为暂停
          audio.value.pause();
        } else {
          // 暂停中,点击则为播放
          audio.value.play();
        }
      } else if (mPlayer.value) {
        mPlayer.value.play();
      }
    }
    function close() {
      console.log("close", audio);
      clearSongs();
      setPlaying(true);
      play();
    }
    if (props.songInfo.enclosure) {
      if (song.value) {
      }
      if (!song.value || props.songInfo.enclosure != song.value.enclosure) {
        pushSong(props.songInfo);
      }
    } else {
      // setMPlayer({ play });
    }
    // watch(currentTime, () => {
    //   if (audio.value && currentTime.value) {
    //     let audio0 = audio.value;
    //     let currentTime0 = currentTime.value;
    //     let v = string2Time(currentTime0);
    //     if (v > audio0.currentTime + 2 || v + 2 < audio0.currentTime) {
    //       audio.value.currentTime = v;
    //     }
    //   }
    // });
    // watch(audio, () => {
    //   if (currentTime.value && currentTime.value != "00:00") {
    //     audio.value.currentTime = string2Time(currentTime.value);
    //   }
    // });
    return {
      audio,
      // processWidth,
      // mPlayer,
      // song,
      // totalTime,
      // currentTime,
      // playing,
      // pushSong,
      // setCurrentTime,
      // setPlaying,
      // // setProcessWidth,
      // setTotalTime,
      play,
      close,
    };
  },
  computed: {
    calSongInfo() {
      return this.song || {};
    },
  },
  mounted() {
    // this.init();
  },
  methods: {
    init() {
      if (this.audio) {
        this.setTotalTime(timeToString(this.audio.duration));
        this.audioInit();
      }
    },
    changePrecent(v) {
      this.setProcessWidth(v);
      let s = ((string2Time(this.totalTime) / 100) * v).toFixed(0);
      let time = timeToString(s);
      console.log("tttt", time);
      this.setCurrentTime(time);
    },
    audioInit() {
      let _this = this;
      let audio = this.audio;
      // 播放开始
      audio.addEventListener("play", () => {
        console.log("play");
        this.setPlaying(true);
      });

      // 播放暂停
      audio.addEventListener("pause", () => {
        console.log("pause");
        this.setPlaying(false);
      });

      // 播放位置改变时触发[注意:播放和调整指示定位时都会触发]（主要事件）
      audio.addEventListener("timeupdate", () => {
        // 当前播放时间
        let currentTime = timeToString(audio.currentTime);
        if (currentTime != _this.currentTime) {
          // console.log(currentTime);
          _this.setCurrentTime(currentTime);
          // 总播放时间
          _this.totalTime = timeToString(audio.duration);
          // 当前播放进度百分比
          let precent = audio.currentTime / audio.duration || 0;
          // 当前播放进度
          _this.processWidth = precent.toFixed(3) * 100;
          // console.log(precent, audio.currentTime, audio.duration, currentTime)
        }
      });

      // 音频或视频能够不停顿地一直播放
      audio.addEventListener("canplaythrough", () => {
        console.log("canplaythrough");
      });

      // 音频或视频的时长已改变
      audio.addEventListener("durationchange", () => {
        console.log("durationchange");
        // _this.totalTime = _this.timeToString(audio.duration);
      });

      // 在音频或视频终止加载时触发，包括终止当前播放（未加载完）进行下一首播放时也会触发
      audio.addEventListener("abort", () => {
        console.log("abort");
      });

      // 在音频或视频加载发生错误时触发
      audio.addEventListener("error", () => {
        console.log("error");
        console.log("-----networkState---------", audio.networkState);
        console.log("-----readyState---------", audio.readyState);
        switch (audio.networkState) {
          case "0":
            _this.error = "尚未初始化";
            break;
          case "1":
            _this.error = "正在下载数据";
            break;
          case "3":
            _this.error = "未找到资源";
            break;
        }
        audio.readyState == "0" && (_this.error = "音频地址错误");

        setTimeout(() => {
          _this.error = "";
        }, 3000);
      });

      // 播放结束
      audio.addEventListener(
        "ended",
        () => {
          setTimeout(() => {
            audio.play();
          }, 1500);
        },
        true
      );
    },
  },
  watch: {
    songInfo(v) {
      this.setPlaying(false);
      this.pushSong(v);
      let u = navigator.userAgent;
      let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
      if (isIOS && this.audio) {
        // audio = new Audio();
        this.audio.src = this.songInfo.enclosure;
        this.audio.load();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.mp-play-track {
  //   background: #eee;
  padding: 15px;
  display: grid;
  grid-template-columns: 88px auto;
  grid-column-gap: 15px;

  //   box-shadow: 5px 5px 8px #aaa;
}
::v-deep {
  .v-input__details {
    display: none;
  }
  .v-btn--variant-elevated,
  .v-btn--variant-flat {
    background: rgba(0, 0, 0, 0.3);
  }
  .v-slider.v-input--horizontal .v-input__control {
    min-height: 0;
  }
}
.song-info {
  display: grid;
  small {
    font-size: 60%;
  }
}
.song-title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.close {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
