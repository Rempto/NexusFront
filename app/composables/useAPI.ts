import { useFetch } from "#app";
import { useAuthStore } from "../../stores";
import { useNuxtApp } from "#app";

type useFetchType = typeof useFetch;

export const useAPI = $fetch.create({
  onRequest({ options }) {
    const config = useRuntimeConfig();
    const store = useAuthStore();

    options.baseURL = config.public.baseURL;

    console.log("OPTIONSSSSS", options);

    if (store.token) {
      options.headers = new Headers(options.headers as HeadersInit);
      options.headers.set("Authorization", `Bearer ${store.token}`);
    }
  },
  onRequestError({ error }) {
    const toast = useToast();
    toast.add({
      title: "Erro de conexão",
      description: error.message,
      color: "error",
    });
  },
  onResponseError({ response }) {
    const toast = useToast();
    toast.add({
      title: "Erro",
      description: response._data?.message ?? "Algo deu errado",
      color: "error",
    });
  },
});
