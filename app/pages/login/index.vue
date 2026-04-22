<template>
  <div>
    <div style="height: 100vh" class="flex justify-center items-center">
      <UCard style="min-width: 390px; max-width: 750px" variant="soft">
        <template #header>
          <h2 class="text-lg font-semibold">Login</h2>
        </template>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4 flex flex-col"
          @submit="login"
        >
          <UFormField label="E-mail" name="email">
            <UInput
              v-model="state.email"
              type="email"
              placeholder="Enter your email"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Password" name="password">
            <UInput
              v-model="state.password"
              type="password"
              placeholder="Enter your password"
              class="w-full"
            />
          </UFormField>
          <div class="flex items-center justify-between">
            <NuxtLink
              to="/register"
              class="text-sm text-primary hover:underline"
            >
              Don't have an account? Register
            </NuxtLink>
          </div>
          <div>
            <UButton type="submit" color="primary">Login</UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import * as v from "valibot";

definePageMeta({
  layout: "empty",
});
// #region Form Validation
const schema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty("E-mail é obrigatório"),
    v.email("E-mail inválido"),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Senha é obrigatória"),
    v.minLength(6, "A senha deve ter no mínimo 6 caracteres"),
  ),
});
// #endregion

const state = reactive({
  email: "",
  password: "",
});

async function login(event) {
  console.log("Login com:", event.data);
  // chamar sua API aqui

  const { data, error } = await useAPI("Auth/login", {
    method: "POST",
    body: { ...event.data },
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error.message);
    });
}
</script>
