<!-- src/views/Download.vue -->
<template>
  <div class="page">
    <h3>下载APP</h3>
    <v-card class="mt-5">
      <v-card-title>
        <v-icon size="small"> mdi-import</v-icon>
        试用账号
      </v-card-title>
      <v-card-text>
        <div class="line">
          支持fever的应用填入网址: https://api.webfollow.cc/plugins/fever/
        </div>
        <div class="line">
          支持googleReader的应用填入网址:
          https://api.webfollow.cc/plugins/greader/
        </div>
        <div class="line">试用账号 guest/123456</div>
      </v-card-text>
    </v-card>
    <v-card class="mt-5">
      <v-card-title>
        <v-icon size="small"> mdi-download-box-outline</v-icon>
        客户端下载
      </v-card-title>
      <v-card-text>
        <v-expansion-panels flat>
          <v-expansion-panel
            v-for="item in items"
            :key="item.title"
            :title="item.title"
          >
            <v-expansion-panel-text>
              <p v-for="sub in item.data" class="line">
                <span v-text="sub.title"></span>
                :
                <a :href="sub.url">点击下载</a>
              </p>
              <p>
                <span>使用教程</span>
                :
                <span class="download-link" @click="dialog = true"
                  >点击查看</span
                >
              </p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
    <v-card class="mt-5">
      <v-card-title>
        <v-icon size="small"> mdi-account-box-outline</v-icon>
        升级会员
      </v-card-title>
      <v-card-text>
        <div class="line">拥有自己独享的账号</div>
        <div class="line">支持离线使用</div>
        <div class="line">跨平台，多客户端</div>
        <div class="line">网页端支持图文混排</div>
        <div class="line">网页端支持章节导航</div>
        <div class="line">一月仅需6元，学生3元一月</div>
        <a
          target="_blank"
          href="https://zhidayingxiao.cn/to/06g6yb"
          class="download-link"
          >点击购买</a
        >
      </v-card-text>
    </v-card>
    <v-dialog v-model="dialog" width="auto">
      <v-card max-width="400" prepend-icon="mdi-tune" title="使用教程">
        <v-card-text>
          下载应用后
          <br />
          <br />
          在支持fever api的地方填写
          <br />
          https://api.webfollow.cc/plugins/fever/
          <br />
          <br />
          在支持 googleReader api的地方填写
          <br />
          https://api.webfollow.cc/plugins/greader/
          <br />
          <br />
          <p>输入账号：guest 密码：123456</p>
        </v-card-text>
        <template v-slot:actions>
          <v-btn class="ms-auto" text="Ok" @click="dialog = false"></v-btn>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "Download",
  data() {
    return {
      dialog: false,
      items: [
        {
          title: "iOS",
          data: [
            {
              title: "Reeder",
              url: "https://apps.apple.com/us/app/reeder/id6475002485",
            },
            {
              title: "Fiery Feeds ",
              url: "https://apps.apple.com/us/app/fiery-feeds-rss-reader/id1158763303",
            },
            {
              title: "Unread",
              url: "https://apps.apple.com/us/app/unread-an-rss-reader/id1363637349",
            },
            {
              title: "NewsBlur",
              url: "https://apps.apple.com/us/app/newsblur/id463981119",
            },
          ],
          useUrl: "",
        },
        {
          title: "安卓",
          data: [
            {
              title: "Read You",
              url: "https://github.com/Ashinch/ReadYou/releases",
            },
            {
              title: "NewsBlur",
              url: "https://play.google.com/store/apps/details?id=com.newsblur",
            },
            {
              title: "FeedMe",
              url: "https://play.google.com/store/apps/details?id=com.seazon.feedme",
            },
            {
              title: "Readrops",
              url: "https://github.com/readrops/Readrops/releases",
            },
            {
              title: "RSS Reader",
              url: " https://play.google.com/store/apps/details?id=com.rss.reader.global",
            },
          ],
          useUrl: "",
        },
        {
          title: "mac",
          data: [
            {
              title: "Reeder",
              url: "https://apps.apple.com/us/app/reeder/id6475002485",
            },
            {
              title: "Fiery Feeds ",
              url: "https://apps.apple.com/us/app/fiery-feeds-rss-reader/id1158763303",
            },
            {
              title: "Unread",
              url: "https://apps.apple.com/us/app/unread-an-rss-reader/id1363637349",
            },
            {
              title: "ReadKit",
              url: "https://apps.apple.com/us/app/readkit-read-later-rss/id1615798039",
            },
          ],
          useUrl: "",
        },
        {
          title: "windows",
          data: [
            {
              title: "QuiteRSS",
              url: "https://github.com/QuiteRSS/quiterss/releases",
            },
            {
              title: "Fiery Feeds ",
              url: "https://apps.apple.com/us/app/fiery-feeds-rss-reader/id1158763303",
            },
          ],
          useUrl: "",
        },
        {
          title: "liunx",
          data: [
            {
              title: "QuiteRSS",
              url: "https://github.com/QuiteRSS/quiterss/releases",
            },
            {
              title: "rssguard ",
              url: "https://github.com/martinrotter/rssguard/releases",
            },
          ],
          useUrl: "",
        },
      ],
    };
  },
};
</script>

<style scoped>
.line {
  line-height: 1.8rem;
}
.download-link {
  margin-top: 0.5rem;
  display: inline-block;
  padding: 5px 10px;
  background-color: #28a745;
  color: white;
  text-decoration: none;
}
img {
  /* width: 260px; */
  max-height: 50vh;
}
</style>
