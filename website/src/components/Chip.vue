<script setup>
  import { Zap, Crown } from 'lucide-vue-next';
  
  const props = defineProps(['label', 'page']);

</script>

<template>
  <div class="flex gap-2 justify-center items-center p-2 bg-accent w-fit rounded-lg text-sm">
    <Zap v-if="page == 'home'" class="text-black w-4 h-4" />
    <Crown v-else />
    <p>{{ label }}</p>
  </div>
</template>