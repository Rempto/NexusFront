<template>
  <div>
    <UCard variant="soft">
      <div class="flex" style="justify-content: space-between">
        <UButton
          :icon="
            openSide ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'
          "
          color="neutral"
          variant="ghost"
          @click="layoutAction"
        />
        <slot />
      </div>
    </UCard>
  </div>
</template>
<script setup>
//#region data
const openSide = ref(true);
const bus = useSidebarBus("layoutAction");

function layoutAction() {
  bus.emit();
  openSide.value = !openSide.value;
}
//#endregion
</script>
