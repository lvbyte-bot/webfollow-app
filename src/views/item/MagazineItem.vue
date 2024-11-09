<template>
  <v-list-item class="magazine-item">
    <div class="magazine py-2">
      <v-icon :color="item.isRead ? 'grey' : 'primary'">
        {{ item.isRead ? "" : "mdi-circle-medium" }}
      </v-icon>

      <div class="desc">
        <p class="text-truncate mb-2 title">{{ item.title }}</p>
        <p class="text-body-2 text-medium-emphasis">{{ item.summary }}</p>
      </div>
      <v-img :src="item.thumbnail" cover height="80px"></v-img>
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
.desc {
  display: grid;
  width: 100%;
  align-self: flex-start;
  .title {
    font-weight: bold;
  }
}
</style>
