<template>
  <div class="page">
    <h3>选择你的套餐</h3>
    <v-row class="mt-2">
      <v-col v-for="(p, index) in packages" :key="index">
        <v-card class="package">
          <v-card-title>{{ p.name }}</v-card-title>
          <v-card-subtitle>￥{{ p.price }}元</v-card-subtitle>
          <v-card-text>
            <ol>
              <li v-for="item in p.lines" v-text="item"></li>
            </ol>
          </v-card-text>
          <v-card-text>
            <v-btn
              size="small"
              color="primary"
              href="https://item.taobao.com/item.htm?ft=t&id=847155285226&skuId=5797611030189&spm=a21dvs.23580594.0.0.1d292c1bqz25TM"
              >选择此套餐</v-btn
            >
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      packages: [
        {
          name: "Pro一月",
          lines: ["最高500个订阅", "支持离线阅读", "支持app阅读器"],
          price: 6,
        },
        {
          name: "Pro一年",
          lines: ["最高500个订阅", "支持离线阅读", "支持app阅读器"],
          price: 36,
        },
      ],
    };
  },
};
</script>

<style scoped>
.package {
  margin: 10px 0;
}

.package ol {
  padding-left: 20px; /* 左侧内边距 */
}
</style>
