import { useAuthStore } from "../../stores/index";
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();

  // rotas públicas — não precisa de autenticação
  const publicRoutes = ["/login", "/register"];

  if (publicRoutes.includes(to.path)) {
    // se já está autenticado e tenta acessar login, redireciona para home
    if (auth.isAuthenticated) {
      return navigateTo("/");
    }
    return;
  }

  // token expirado
  if (auth.validTo) {
    const expired = new Date(auth.validTo) < new Date();
    if (expired) {
      auth.clearAuth();
      return navigateTo("/login");
    }
  }

  // não autenticado
  if (!auth.isAuthenticated) {
    return navigateTo("/login");
  }
});
