<template>
  <v-list-item class="magazine-item py-3">
    <div class="magazine">
      <v-icon :color="item.isRead ? 'grey' : 'primary'">
        {{ item.isRead ? "" : "mdi-circle-medium" }}
      </v-icon>

      <div class="desc">
        <div class="text-body-2 text-truncate text-medium-emphasis mb-2">
          <router-link :to="'/f/' + item.feedId" @click.stop="">
            {{ item.feed?.title }}</router-link
          >
        </div>
        <p class="text-truncate mb-2 title">{{ item.title }}</p>
        <p class="text-body-2 text-medium-emphasis">{{ item.summary }}</p>
      </div>
      <div>
        <div class="text-body-2 text-medium-emphasis mb-2 text-right">
          {{ item.datestr }}
        </div>
        <v-img :src="item.thumbnail" cover height="80px"></v-img>
      </div>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
defineProps(["item"]);
</script>

<style lang="scss" scoped>
.magazine-item {
  padding-left: 5px;
  padding-right: 10px;
}
.magazine {
  display: grid;
  grid-template-columns: 1rem auto minmax(6rem, 1fr);
  align-items: center;
  grid-gap: 1rem;
  .v-img {
    border-radius: 0.5rem;
  }
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
