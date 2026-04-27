import { useEventBus } from "@vueuse/core";

export const useSidebarBus = () => useEventBus<boolean>("sidebar");
