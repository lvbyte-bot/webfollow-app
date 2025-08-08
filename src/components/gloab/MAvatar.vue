<template>
    <v-img v-bind="$attrs" :class="'i-avatar' + (size ? '-' + size : '')">
        <div class="name" v-if="name">{{ name.substr(0, 1) }}</div>
    </v-img>
</template>
<script setup>
defineProps(["name", "size"])
</script>
<style scoped>
.name {
    background-color: rgba(var(--v-theme-primary), .9);
    text-align: center;
    color: rgb(var(--v-theme-background));
}

.v-img.v-img--booting .name {
    display: block;
}

.v-img .name {
    display: none;
}

.i-avatar .name {
    font-size: 0.8rem;
    width: 1.2rem;
    height: 1.2rem;
    line-height: 1.2rem;
    border-radius: 3px;
}

.i-avatar-lg .name {
    font-size: 1.2rem;
    line-height: 2rem;
    border-radius: 5px;
}
</style>