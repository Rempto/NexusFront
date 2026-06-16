<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <UHeader class="shrink-0" style="margin: 0px !important">
      <template #title>
        <NuxtLink to="/"><AppLogo class="h-7" /></NuxtLink>
      </template>
      <template #right>
        <div style="cursor: pointer">
          <UColorModeButton />

          <UIcon name="i-lucide-log-out" class="size-5" @click="logout" />
        </div>
      </template>
    </UHeader>

    <!-- Sidebar + Conteúdo -->
    <div class="flex flex-1 overflow-hidden">
      <aside
        class="shrink-0 border-r border-gray-200 dark:border-gray-800 overflow-y-auto transition-all duration-300"
        :class="openSide ? 'w-64 p-4' : 'w-0 p-0 border-none'"
        style="position: relative"
      >
        <div v-show="openSide">
          <UNavigationMenu
            :items="items"
            orientation="vertical"
            :ui="{ link: 'p-1.5 overflow-hidden' }"
          />
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
<script setup>
import { useAuthStore } from "../../stores/index.ts";

//#region Composable
const authStore = useAuthStore();
const router = useRouter();
//#endregion

//#region data
const openSide = ref(true);

const items = ref([
  {
    label: "Tarefas",
    icon: "i-mdi-view-dashboard-variant",
    active: true,
  },
  {
    label: "Projetos",
    icon: "i-mdi-stack-overflow",
    active: false,
  },
  // {
  //   label: "Inbox",
  //   icon: "i-lucide-inbox",
  //   badge: "4",
  // },
  // {
  //   label: "Contacts",
  //   icon: "i-lucide-users",
  // },
]);

const bus = useSidebarBus("layoutAction");

bus.on(() => {
  toggleSidebar();
});
//#endregion

//#region method
function toggleSidebar() {
  openSide.value = !openSide.value;
}

function logout() {
  router.push("/login");
  authStore.clearAuth();
}
//#endregion
</script>
