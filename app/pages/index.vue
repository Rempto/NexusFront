<template>
  <div>
    <PagesHeader>
      <template #default>
        <UModal
          v-model:open="dialog"
          style="min-width: 390px"
          close-icon="i-lucide-arrow-right"
        >
          <UButton @click="openDialog">Criar tarefa</UButton>
          <template #header>
            {{ isEditing ? "Editar tarefa" : "Criar nova tarefa" }}
          </template>
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
                  v-model="form.dueDate"
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
                  label="Responsável"
                  name="userId"
                  class="flex flex-col w-full"
                >
                  <USelect
                    v-model="form.userId"
                    :items="users"
                    value-key="id"
                    label-key="name"
                    placeholder="Selecione um usuário"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField label="Descrição" name="Descrição" class="w-full">
                <UTextarea
                  v-model="form.description"
                  class="w-full"
                  :rows="8"
                  style="white-space: pre-wrap"
                />
              </UFormField>
              <UCheckbox
                v-if="!isEditing"
                v-model="isIAGenerated"
                label="Criar sem revisão"
              />
              <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-gray-500"
                  >Descreva com IA</span
                >
                <div class="flex gap-2">
                  <UInput
                    v-model="naturalInput"
                    :placeholder="
                      listening
                        ? 'Ouvindo...'
                        : 'Ex: Estudar LangChain essa semana, alta prioridade'
                    "
                    class="w-full"
                    :class="listening ? 'border-red-400' : ''"
                    :disabled="listening"
                  />
                  <UButton
                    :icon="listening ? 'i-lucide-square' : 'i-lucide-mic'"
                    :color="listening ? 'error' : 'neutral'"
                    :variant="listening ? 'solid' : 'outline'"
                    :loading="false"
                    @click="toggleListening"
                  />
                  <UButton
                    icon="i-lucide-sparkles"
                    :loading="interpreting"
                    :disabled="!naturalInput.trim()"
                    @click="interpretTask"
                  />
                </div>
                <div
                  v-if="listening"
                  class="flex items-center gap-2 text-sm text-red-500"
                >
                  <span class="animate-pulse">●</span>
                  <span>Gravando... clique no botão para parar</span>
                </div>
                <div v-if="speechError" class="text-sm text-red-400">
                  {{ speechError }}
                </div>
              </div>
            </UForm>
          </template>
          <template #footer>
            <div class="flex justify-center w-full gap-4">
              <UButton
                @click="closeDialog"
                variant="outline"
                class="flex justify-center"
                style="width: 150px; cursor: pointer"
              >
                Cancelar
              </UButton>
              <UButton
                @click="isEditing ? editTask() : saveTask()"
                class="flex justify-center"
                variant="solid"
                style="width: 150px; cursor: pointer"
                :loading="saving"
              >
                {{ isEditing ? "Atualizar" : "Salvar" }}
              </UButton>
            </div>
          </template>
        </UModal>
      </template>
    </PagesHeader>

    <div class="flex flex-col">
      <span class="mt-6 ml-6">Selecionar projeto</span>
      <USelect
        v-model="selectedProject"
        value-key="id"
        label-key="name"
        :items="projects"
        class="w-64 mb-4 ml-6"
        @change="callTasksOfProject"
      />
    </div>

    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Quadro de tarefas</h1>
      <div class="flex gap-4 overflow-x-auto" style="padding: 1px">
        <div
          v-for="column in columns"
          :key="column.id"
          class="w-80 flex-shrink-0"
        >
          <UCard>
            <template #header>
              <div class="font-semibold">{{ column.name }}</div>
            </template>
            <UProgress
              v-if="
                (column.id === 0 && loadTodo) ||
                (column.id === 1 && loadInProgress) ||
                (column.id === 2 && loadDone)
              "
            >
            </UProgress>
            <draggable
              v-model="column.cards"
              group="kanban"
              item-key="id"
              class="flex flex-col gap-3"
              style="min-height: 100px"
              @change="onChange($event, column.id)"
            >
              <template #item="{ element }">
                <UCard
                  style="
                    min-height: 170px;
                    border-radius: 8px;
                    border: 1px solid #00000054;
                    position: relative;
                  "
                  class="cursor-move p-3 pt-5 rounded shadow mb-2"
                  variant="soft"
                >
                  <div class="absolute top-3 right-2">
                    <div class="flex items-center">
                      <UIcon
                        v-if="element.isAiGenerated"
                        name="i-mdi-robot-happy"
                        class="size-6 mr-2"
                      ></UIcon>
                      <UBadge
                        :style="`background-color:transparent;color:${getPriorityColor(element.priority)}; border:1px solid ${getPriorityColor(element.priority)}`"
                      >
                        {{
                          element.priority === 0
                            ? "Baixo"
                            : element.priority === 1
                              ? "Médio"
                              : element.priority === 2
                                ? "Alto"
                                : "Crítico"
                        }}
                      </UBadge>
                      <UDropdownMenu
                        :items="getCardMenuItems(element)"
                        :popper="{ placement: 'bottom-end' }"
                      >
                        <UIcon
                          class="ml-2"
                          name="i-mdi-dots-vertical"
                          style="cursor: pointer"
                        />
                      </UDropdownMenu>
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <span style="font-weight: bold; font-size: 14px">
                      {{
                        element.title && element.title.length > 30
                          ? element.title.substring(0, 30) + "..."
                          : element.title
                      }}
                    </span>
                    <i class="mt-4" style="font-size: 12px">
                      {{
                        element.description && element.description.length > 100
                          ? element.description.substring(0, 100) + "..."
                          : element.description
                      }}
                    </i>
                  </div>
                </UCard>
              </template>
            </draggable>

            <div>
              <UButton
                v-if="
                  (column.id === 0 && toDoHasMore && !loadTodo) ||
                  (column.id === 1 && inProgressHasMore && !loadInProgress) ||
                  (column.id === 2 && doneHasMore && !loadDone)
                "
                @click="loadMore(column.id)"
                variant="outline"
                class="w-full flex justify-center"
              >
                Carregar mais
              </UButton>
            </div>
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
const isEditing = ref(false);
const saving = ref(false);
const loadingTask = ref(false);

const form = ref({});
const naturalInput = ref("");
const interpreting = ref(false);
const listening = ref(false);
const speechError = ref("");

let recognition = null;

const priorities = ref([
  { label: "Baixo", value: 0 },
  { label: "Médio", value: 1 },
  { label: "Alto", value: 2 },
  { label: "Crítico", value: 3 },
]);

const projects = ref([]);
const users = ref([]);
const selectedProject = ref(null);

const paginationToDo = ref({ page: 1, pageSize: 3, status: 0 });
const paginationInProgress = ref({ page: 1, pageSize: 3, status: 1 });
const paginationDone = ref({ page: 1, pageSize: 3, status: 2 });

const toDoHasMore = ref(true);
const inProgressHasMore = ref(true);
const doneHasMore = ref(true);

const loadTodo = ref(false);
const loadInProgress = ref(false);
const loadDone = ref(false);

const columns = ref([
  { id: 0, name: "A Fazer", cards: [] },
  { id: 1, name: "Em andamento", cards: [] },
  { id: 2, name: "Concluído", cards: [] },
]);

const isIAGenerated = ref(false);
//#endregion

//#region Card menu
function getCardMenuItems(element) {
  return [
    [
      {
        label: "Editar",
        icon: "i-lucide-pencil",
        onSelect: () => openEditDialog(element),
      },
    ],
  ];
}
//#endregion

//#region Speech Recognition
function initRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    speechError.value = "Seu browser não suporta reconhecimento de voz.";
    return null;
  }

  const r = new SpeechRecognition();
  r.lang = "pt-BR";
  r.continuous = false;
  r.interimResults = true;

  r.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");
    naturalInput.value = transcript;
  };

  r.onerror = (event) => {
    listening.value = false;
    if (event.error === "not-allowed")
      speechError.value =
        "Permissão de microfone negada. Habilite nas configurações do browser.";
    else speechError.value = `Erro: ${event.error}`;
  };

  r.onend = () => {
    listening.value = false;
  };

  return r;
}

function toggleListening() {
  speechError.value = "";
  if (listening.value) {
    recognition?.stop();
    listening.value = false;
    return;
  }
  recognition = initRecognition();
  if (!recognition) return;
  recognition.start();
  listening.value = true;
}
//#endregion

//#region IA
async function interpretTask() {
  if (!naturalInput.value.trim()) return;

  interpreting.value = true;
  try {
    const response = await useAPI("ai/interpret-task", {
      method: "POST",
      body: { input: naturalInput.value },
    });

    form.value.title = response.content.title;
    form.value.description =
      response.content.description?.replace(/\\n/g, "\n") ?? "";
    form.value.priority = response.content.priority;
    form.value.prazo = response.content.dueDate
      ? new Date(response.content.dueDate)
      : null;

    naturalInput.value = "";
    if (isIAGenerated.value) saveTask();
  } catch (error) {
    console.error("Erro ao interpretar:", error);
  } finally {
    interpreting.value = false;
  }
}
//#endregion

//#region methods
function openDialog() {
  isEditing.value = false;
  form.value = {};
  dialog.value = true;
}

async function openEditDialog(element) {
  isEditing.value = true;
  form.value = {};
  dialog.value = true;
  loadingTask.value = true;

  try {
    const response = await useAPI("task/get-one", {
      method: "GET",
      params: { id: element.id },
    });

    const task = response.content;
    form.value = {
      id: task.id,
      title: task.title,
      description: task.description?.replace(/\\n/g, "\n") ?? "",
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      userId: task.userId ?? null,
      status: task.status,
    };
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error);
  } finally {
    loadingTask.value = false;
  }
}

function closeDialog() {
  dialog.value = false;
  form.value = {};
  isEditing.value = false;
  isIAGenerated.value = false;
}

async function saveTask() {
  saving.value = true;
  try {
    const model = {
      ...form.value,
      projectId: selectedProject.value,
      status: 0,
      IsAiGenerated: isIAGenerated.value,
    };
    await useAPI("task/create", { method: "POST", body: model });
    closeDialog();
    await nextTick();
    callTasksOfProject();
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
  } finally {
    saving.value = false;
  }
}

async function editTask() {
  saving.value = true;
  try {
    const model = {
      ...form.value,
      projectId: selectedProject.value.id,
    };
    await useAPI("task/edit", { method: "PUT", body: model });
    closeDialog();
    await nextTick();
    callTasksOfProject();
  } catch (error) {
    console.error("Erro ao editar tarefa:", error);
  } finally {
    saving.value = false;
  }
}

function onChange(event, status) {
  if (event.added) updateStatus(event.added.element, status);
}

async function updateStatus(item, status) {
  try {
    await useAPI("task/update-status", {
      method: "PUT",
      body: { id: item.id, status },
    });
    item.status = status;
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case 0:
      return "green";
    case 1:
      return "orange";
    case 2:
      return "darkorange";
    case 3:
      return "red";
    default:
      return "gray";
  }
}

function callTasksOfProject() {
  columns.value = [
    { id: 0, name: "A Fazer", cards: [] },
    { id: 1, name: "Em andamento", cards: [] },
    { id: 2, name: "Concluído", cards: [] },
  ];
  paginationDone.value.page = 1;
  paginationInProgress.value.page = 1;
  paginationToDo.value.page = 1;
  getTasks(0);
  getTasks(1);
  getTasks(2);
}

async function getProjects() {
  await useAPI("project/get-all-reduced", { method: "GET" }).then(
    (response) => {
      projects.value = response.content;
      if (projects.value.length > 0)
        selectedProject.value = projects.value[0].id;
      callTasksOfProject();
    },
  );
}

async function getUsers() {
  await useAPI("user/get-all-reduced", { method: "GET" }).then((response) => {
    users.value = response.content;
  });
}

async function getTasks(status, resetCols = true) {
  const model = { projectId: selectedProject.value, status };
  if (status === 0) {
    model.page = paginationToDo.value.page;
    model.pageSize = paginationToDo.value.pageSize;
    loadTodo.value = true;
  } else if (status === 1) {
    model.page = paginationInProgress.value.page;
    model.pageSize = paginationInProgress.value.pageSize;
    loadInProgress.value = true;
  } else if (status === 2) {
    model.page = paginationDone.value.page;
    model.pageSize = paginationDone.value.pageSize;
    loadDone.value = true;
  }

  await useAPI("task/filtered-and-paginated", { method: "POST", body: model })
    .then((response) => {
      console.log(response);
      const result = response.content;
      attachCardToCorrectColumn(result.data, status, resetCols);
      attachPagination(result, status);
      stopLoading(status);
    })
    .catch((error) => {
      console.error(error);
      stopLoading(status);
    });
}

function stopLoading(status) {
  if (status === 0) loadTodo.value = false;
  else if (status === 1) loadInProgress.value = false;
  else if (status === 2) loadDone.value = false;
}

function loadMore(status) {
  if (status === 0) paginationToDo.value.page++;
  else if (status === 1) paginationInProgress.value.page++;
  else if (status === 2) paginationDone.value.page++;

  getTasks(status, false);
}

function attachPagination(result, status) {
  if (status === 0) {
    paginationToDo.value.page = result.pager.currentPage;
    toDoHasMore.value = paginationToDo.value.page < result.pager.totalPages;
  } else if (status === 1) {
    paginationInProgress.value.page = result.pager.currentPage;
    inProgressHasMore.value =
      paginationInProgress.value.page < result.pager.totalPages;
  } else if (status === 2) {
    paginationDone.value.page = result.pager.currentPage;
    doneHasMore.value = paginationDone.value.page < result.pager.totalPages;
  }
}

function attachCardToCorrectColumn(tasks, status, resetCols = false) {
  const column = columns.value.find((col) => col.id === status);
  if (column && tasks.length > 0) {
    if (resetCols) column.cards = [];
    column.cards.push(...tasks);
  }
}
//#endregion

getProjects();
getUsers();
</script>
