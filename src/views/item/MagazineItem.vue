<template>
  <v-list-item class="magazine-item py-3">
    <div class="magazine">
      <v-icon :color="item.isRead ? '-' : 'primary'">
        {{ item.isRead ? "" : "mdi-circle-medium" }}
      </v-icon>
      <div>
        <div class="magazine-one mb-2">
          <div class="text-body-2 text-truncate text-medium-emphasis">
            <router-link :to="'/f/' + item.feedId" @click.stop="">
              {{ getSource() }}</router-link
            >
          </div>
          <div class="text-body-2 text-medium-emphasis text-right">
            {{ item.datestr }}
          </div>
        </div>
        <div class="magazine-sec" :class="{ nomagazinethumb: !item.thumbnail }">
          <div class="desc">
            <p class="text-truncate mb-2 title">{{ item.title }}</p>
            <p class="text-body-2 text-medium-emphasis">{{ item.summary }}</p>
          </div>
          <div v-if="item.thumbnail">
            <v-img :src="item.thumbnail" cover height="80px"></v-img>
          </div>
        </div>
      </div>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
const props = defineProps(["item", "type"]);

function getSource() {
  const source =
    props.type === "f"
      ? props.item.author || props.item.feed?.title
      : props.item.feed?.title;
  return source;
}
</script>

<style lang="scss" scoped>
.magazine-item {
  padding-left: 5px;
  padding-right: 10px;
}
.magazine {
  display: grid;
  grid-template-columns: 1rem auto;
  align-items: center;
  grid-gap: 1rem;
  .v-img {
    border-radius: 0.5rem;
  }
}
.magazine-one {
  display: grid;
  grid-template-columns: auto 6rem;
}
.magazine-sec {
  display: grid;
  grid-template-columns: auto minmax(6rem, 1fr);
  grid-gap: 0.5rem;
}
.nomagazinethumb {
  grid-template-columns: 1fr;
}
.text-right {
  text-align: right;
}
.desc {
  display: grid;
  width: 100%;
  align-self: flex-start;
  .title {
    font-weight: bold;
  }
}
a {
  text-decoration: none;
  color: rgb(var(--v-theme-surface-variant));
  &:hover {
    text-decoration: underline;
  }
}
</style>
