export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref<string | null>(null);

    const setToken = (t: string) => (token.value = t);
    const clearToken = () => (token.value = null);

    return { token, setToken, clearToken };
  },
  { persist: true },
);
