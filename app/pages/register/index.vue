<template>
  <div>
    <div style="height: 100vh" class="flex justify-center items-center">
      <UCard style="min-width: 390px; max-width: 750px" variant="soft">
        <template #header>
          <h2 class="text-lg font-semibold">Registrar</h2>
        </template>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4 flex flex-col"
          @submit="register"
        >
          <div class="flex flex-col sm:flex-row gap-4">
            <UFormField label="Nome" name="firstName" class="flex-1">
              <UInput
                v-model="state.firstName"
                type="text"
                placeholder="Insira seu nome"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Sobrenome" name="lastName" class="flex-1">
              <UInput
                v-model="state.lastName"
                type="text"
                placeholder="Insira seu sobrenome"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="E-mail" name="email">
            <UInput
              v-model="state.email"
              type="email"
              placeholder="Insira seu e-mail"
              class="w-full"
            />
          </UFormField>

          <div class="flex flex-col sm:flex-row gap-4">
            <UFormField label="Senha" name="password" class="flex-1">
              <UInput
                v-model="state.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Insira sua senha"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    color="neutral"
                    variant="link"
                    :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    "
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </UFormField>
            <UFormField
              label="Confirmação de Senha"
              name="confirmPassword"
              class="flex-1"
            >
              <UInput
                v-model="state.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirme sua senha"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    color="neutral"
                    variant="link"
                    :icon="
                      showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                    "
                    :aria-label="
                      showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
                    "
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </UInput>
            </UFormField>
          </div>

          <div class="flex items-center justify-between">
            <NuxtLink to="/login" class="text-sm text-primary hover:underline">
              Possui uma conta? Faça login
            </NuxtLink>
          </div>
          <div>
            <UButton type="submit" color="primary">Register</UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import * as v from "valibot";
import { useAuthStore } from "../../../stores/index";

definePageMeta({
  layout: "empty",
});

const router = useRouter();
const auth = useAuthStore();

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const schema = v.pipe(
  v.object({
    firstName: v.pipe(v.string(), v.nonEmpty("Nome é obrigatório")),
    lastName: v.pipe(v.string(), v.nonEmpty("Sobrenome é obrigatório")),
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
    confirmPassword: v.pipe(
      v.string(),
      v.nonEmpty("Confirmação de senha é obrigatória"),
    ),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "As senhas não coincidem",
    ),
    ["confirmPassword"],
  ),
);

const state = reactive({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

async function register(event) {
  try {
    const response = await useAPI("user/create", {
      method: "POST",
      body: event.data,
    });

    router.push("/login");
  } catch (error) {}
}
</script>
