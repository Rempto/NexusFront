export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref<string | null>(null);
    const user = ref<any | null>(null);
    const validTo = ref<string | null>(null);

    const setAuth = (data: { token: string; user: any; validTo: string }) => {
      token.value = data.token;
      user.value = data.user;
      validTo.value = data.validTo;
    };

    const clearAuth = () => {
      token.value = null;
      user.value = null;
      validTo.value = null;
    };

    const isAuthenticated = computed(() => !!token.value);

    return { token, user, validTo, setAuth, clearAuth, isAuthenticated };
  },
  { persist: true },
);
