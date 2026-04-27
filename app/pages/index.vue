<!-- eslint-disable -->
<template>
  <div>
    <PagesHeader>
      <template #default>
        <UModal v-model="dialog" style="min-width: 390px">
          <UButton @click="openDialog">Criar tarefa</UButton>
          <template #header> Criar nova tarefa </template>
          <template #body>
            <UForm
              :validate="validate"
              :state="state"
              class="space-y-4"
              @submit="onSubmit"
            >
              <UFormField
                label="Título"
                name="Título"
                class="flex flex-col w-full"
              >
                <UInput v-model="form.title" class="w-full" />
              </UFormField>
              <UFormField
                label="Prazo"
                name="Prazo"
                class="flex flex-col w-full"
              >
                <UInputDate
                  v-model="form.prazo"
                  icon="i-lucide-calendar"
                  class="w-full"
                  locale="pt-BR"
                />
              </UFormField>
              <div class="flex flex-col md:flex-row gap-4">
                <UFormField
                  label="Prioridade"
                  name="Prioridade"
                  class="flex flex-col w-full"
                >
                  <USelect
                    v-model="form.priority"
                    :items="priorities"
                    value-key="value"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Status"
                  name="Status"
                  class="flex flex-col w-full"
                >
                  <USelect
                    v-model="form.status"
                    :items="items"
                    value-key="value"
                    class="w-full"
                  />
                </UFormField>
              </div>
              <UFormField
                label="Projetos"
                name="Projetos"
                class="flex flex-col w-full"
              >
                <USelect
                  v-model="form.project"
                  :items="projects"
                  value-key="id"
                  label-key="name"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Descrição" name="Descrição" class="w-full">
                <UTextarea v-model="form.description" class="w-full" />
              </UFormField>
            </UForm>
          </template>
          <template #footer>
            <div class="flex justify-center w-full gap-4">
              <UButton
                @click="dialog = false"
                variant="outline"
                style="width: 150px; cursor: pointer"
                class="d-flex justify-center"
                >Cancelar</UButton
              >
              <UButton
                @click="saveTask"
                variant="solid"
                style="width: 150px; cursor: pointer"
                class="d-flex justify-center"
                >Salvar</UButton
              >
            </div>
          </template>
        </UModal>
      </template>
    </PagesHeader>

    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Kanban</h1>

      <div class="flex gap-4 overflow-x-auto" style="padding: 1px">
        <div
          v-for="column in columns"
          :key="column.id"
          class="w-80 flex-shrink-0"
        >
          <!-- Coluna -->
          <UCard>
            <template #header>
              <div class="font-semibold">
                {{ column.name }}
              </div>
            </template>
            <draggable
              v-model="column.cards"
              group="kanban"
              item-key="id"
              class="flex flex-col gap-3"
              style="min-height: 100px"
            >
              <template #item="{ element }">
                <UCard
                  class="cursor-move p-3 rounded shadow mb-2"
                  variant="soft"
                >
                  {{ element.title }}
                </UCard>
              </template>
            </draggable>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import draggable from "vuedraggable";
//#region data
const dialog = ref(false);

const form = ref({});

const items = ref([
  { label: "Backlog", value: 0 },
  { label: "Todo", value: 1 },
  { label: "In Progress", value: 2 },
  { label: "Done", value: 3 },
]);

const priorities = ref([
  { label: "Baixo", value: 0 },
  { label: "Médio", value: 1 },
  { label: "Alto", value: 2 },
  { label: "Crítico", value: 3 },
]);

const projects = ref([]);

const columns = ref([
  {
    id: 1,
    name: "A Fazer",
    cards: [
      { id: 1, title: "Criar layout" },
      { id: 2, title: "Definir API" },
    ],
  },
  {
    id: 2,
    name: "Em andamento",
    cards: [{ id: 3, title: "Tela de login" }],
  },
  {
    id: 3,
    name: "Concluído",
    cards: [{ id: 4, title: "Setup do projeto" }],
  },
]);

//#endregion

//#region Call Services
getProjects();
//#endregion

//#region method

function openDialog() {
  dialog.value = true;
}

async function getProjects() {
  await useAPI("project/get-all-reduced", {
    method: "GET",
  }).then((response) => {
    console.log(response);
    projects.value = response.content;
  });
}
//#endregion
</script>
