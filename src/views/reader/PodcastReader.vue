<template>
  <v-card flat height="100vh">
    <div class="grid">
      <div class="podcat-reader">
        <v-card class="text-center">
          <v-img
            max-height="560"
            :aspect-ratio="1"
            src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
            cover
          ></v-img>

          <v-card-title class="mt-5"
            >Use Google's location service?</v-card-title
          >

          <v-card-text>
            <div class="pa-6">
              Lorem ipsum dolor sit amet, semper quis, sapien id natoque elit.
              Nostra urna at, magna at neque sed sed ante imperdiet, dolor
              mauris cursus velit, velit non,
            </div>

            <v-progress-linear
              bg-color="surface-variant"
              class="my-6"
              color="primary"
              height="10"
              model-value="2"
              rounded="pill"
            ></v-progress-linear>
            <v-btn class="mt-5" icon="mdi-play" variant="text"></v-btn>
          </v-card-text>
        </v-card>
      </div>
      <div class="ovf">
        <basic-reader></basic-reader>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import BasicReader from "./BasicReader.vue";
</script>

<style scoped>
.grid {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(30vw, 1fr) 1fr;
}
.podcat-reader {
  background: linear-gradient(
    to right bottom,
    rgb(95, 234, 131),
    rgb(65, 184, 131)
  );
  .v-card {
    max-width: 580px;
    height: 100%;
    margin: 0 auto;
    background-color: rgba(255, 255, 255, 0.4);
  }
}
</style>
