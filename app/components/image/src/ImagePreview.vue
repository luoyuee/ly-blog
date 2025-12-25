<script lang="ts" setup>
import type { CropperImage } from "cropperjs";

const props = defineProps({
  src: {
    type: String,
    required: true
  }
});

const cropperImageRef = ref<CropperImage | null>(null);

const setContain = async () => {
  if (!cropperImageRef.value) return;

  await nextTick();
  await cropperImageRef.value.$ready();
  cropperImageRef.value.$center("contain");
};

onMounted(async () => {
  await import("cropperjs");
  await setContain();
});

watch(
  () => props.src,
  async () => {
    setContain();
  }
);
</script>
<template>
  <ClientOnly>
    <cropper-canvas background class="w-full h-full">
      <cropper-image
        ref="cropperImageRef"
        initial-center-size="contain"
        rotatable
        scalable
        skewable
        translatable
        :alt="props.src"
        :src="props.src"
      />
      <cropper-handle action="move" plain />
    </cropper-canvas>
  </ClientOnly>
</template>
