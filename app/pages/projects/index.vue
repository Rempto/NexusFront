<template>
  <div>
    <!-- Modal Criar / Editar -->
    <UModal
      v-model:open="dialog"
      style="min-width: 480px"
      close-icon="i-lucide-x"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <span
            v-if="form.color"
            class="inline-block w-3 h-3 rounded-full"
            :style="`background:${form.color}`"
          />
          {{ isEditing ? "Editar projeto" : "Criar novo projeto" }}
        </div>
      </template>

      <template #body>
        <UForm :state="form" class="space-y-4" @submit.prevent>
          <UFormField label="Nome" name="name" required>
            <UInput
              v-model="form.name"
              placeholder="Nome do projeto"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Descrição" name="description">
            <UTextarea
              v-model="form.description"
              placeholder="Descreva o projeto..."
              :rows="3"
              class="w-full"
            />
          </UFormField>

          <div class="flex flex-col sm:flex-row gap-4">
            <UFormField label="Status" name="status" class="flex-1">
              <USelect
                v-model="form.status"
                :items="statusOptions"
                value-key="value"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Prazo" name="dueDate" class="flex-1">
              <UInputDate
                v-model="form.dueDate"
                icon="i-lucide-calendar"
                class="w-full"
                locale="pt-BR"
              />
            </UFormField>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <UFormField label="Responsável" name="userId" class="flex-1">
              <USelect
                v-model="form.userId"
                :items="users"
                value-key="id"
                label-key="name"
                placeholder="Selecione um usuário"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Cor de identificação"
              name="color"
              class="flex-1"
            >
              <div class="flex items-center gap-2">
                <input
                  v-model="form.color"
                  type="color"
                  class="w-10 h-9 rounded cursor-pointer border border-gray-200"
                  style="padding: 2px"
                />
                <UInput
                  v-model="form.color"
                  placeholder="#3b82f6"
                  class="flex-1"
                  maxlength="7"
                />
              </div>
            </UFormField>
          </div>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-center w-full gap-4">
          <UButton variant="outline" style="width: 150px" @click="closeDialog">
            Cancelar
          </UButton>
          <UButton
            variant="solid"
            style="width: 150px"
            :loading="saving"
            @click="isEditing ? editProject() : saveProject()"
          >
            {{ isEditing ? "Atualizar" : "Salvar" }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Header com botão de criar -->
    <PagesHeader>
      <template #default>
        <UButton icon="i-lucide-plus" @click="openCreateDialog">
          Novo projeto
        </UButton>
      </template>
    </PagesHeader>

    <!-- Filtro -->
    <div class="px-6 pt-4 pb-2 flex items-center gap-3">
      <UInput
        v-model="search"
        placeholder="Buscar por nome..."
        icon="i-lucide-search"
        class="w-72"
        @input="onSearchInput"
      />
    </div>

    <!-- Tabela -->
    <div class="px-6 pb-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Projetos</span>
            <span class="text-sm text-gray-400"
              >{{ totalItems }} projeto(s)</span
            >
          </div>
        </template>

        <div v-if="loading" class="flex justify-center py-10">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
        </div>

        <div
          v-else-if="projects.length === 0"
          class="text-center py-10 text-gray-400"
        >
          Nenhum projeto encontrado.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr
                class="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500"
              >
                <th class="py-3 px-2 font-medium w-6"></th>
                <th class="py-3 px-2 font-medium">Nome</th>
                <th class="py-3 px-2 font-medium">Status</th>
                <th class="py-3 px-2 font-medium">Prazo</th>
                <th class="py-3 px-2 font-medium">Responsável</th>
                <th class="py-3 px-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="project in projects"
                :key="project.id"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td class="py-3 px-2">
                  <span
                    class="inline-block w-3 h-3 rounded-full"
                    :style="`background:${project.color || '#94a3b8'}`"
                  />
                </td>
                <td class="py-3 px-2 font-medium">
                  <div>{{ project.name }}</div>
                  <div
                    v-if="project.description"
                    class="text-xs text-gray-400 truncate max-w-xs"
                  >
                    {{ project.description }}
                  </div>
                </td>
                <td class="py-3 px-2">
                  <UBadge
                    variant="outline"
                    :style="`color:${getStatusColor(project.status)}; border-color:${getStatusColor(project.status)}`"
                  >
                    {{ getStatusLabel(project.status) }}
                  </UBadge>
                </td>
                <td class="py-3 px-2 text-gray-500">
                  {{ project.dueDate ? formatDate(project.dueDate) : "—" }}
                </td>
                <td class="py-3 px-2 text-gray-500">
                  {{ project.userName || "—" }}
                </td>
                <td class="py-3 px-2">
                  <div class="flex items-center justify-end gap-2">
                    <UButton
                      icon="i-lucide-pencil"
                      variant="ghost"
                      size="xs"
                      @click="openEditDialog(project)"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      variant="ghost"
                      size="xs"
                      color="error"
                      @click="confirmDelete(project)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <template #footer>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-400">
              Página {{ pagination.page }} de {{ totalPages }}
            </span>
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-chevron-left"
                variant="outline"
                size="xs"
                :disabled="pagination.page <= 1"
                @click="changePage(pagination.page - 1)"
              />
              <UButton
                icon="i-lucide-chevron-right"
                variant="outline"
                size="xs"
                :disabled="pagination.page >= totalPages"
                @click="changePage(pagination.page + 1)"
              />
            </div>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <UModal v-model:open="deleteDialog" style="max-width: 400px">
      <template #header>Confirmar exclusão</template>
      <template #body>
        <p class="text-sm text-gray-500">
          Tem certeza que deseja excluir o projeto
          <strong>{{ projectToDelete?.name }}</strong
          >? Essa ação não pode ser desfeita.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-center w-full gap-4">
          <UButton
            variant="outline"
            style="width: 140px"
            @click="deleteDialog = false"
          >
            Cancelar
          </UButton>
          <UButton
            variant="solid"
            color="error"
            style="width: 140px"
            :loading="deleting"
            @click="deleteProject"
          >
            Excluir
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

//#region data
const dialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const deleting = ref(false);
const loading = ref(false);

const form = ref({});
const projects = ref([]);
const users = ref([]);
const projectToDelete = ref(null);
const totalItems = ref(0);
const search = ref("");
let searchTimeout = null;

const pagination = ref({ page: 1, pageSize: 20 });

const statusOptions = [
  { label: "Ativo", value: 0 },
  { label: "Pausado", value: 1 },
  { label: "Concluído", value: 2 },
  { label: "Arquivado", value: 3 },
];

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / pagination.value.pageSize)),
);
//#endregion

//#region helpers
function getStatusLabel(status) {
  return statusOptions.find((s) => s.value === status)?.label ?? "—";
}

function getStatusColor(status) {
  switch (status) {
    case 0:
      return "#22c55e"; // Active  - green
    case 1:
      return "#f59e0b"; // Paused  - amber
    case 2:
      return "#3b82f6"; // Completed - blue
    case 3:
      return "#94a3b8"; // Archived - gray
    default:
      return "#94a3b8";
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR");
}
//#endregion

//#region dialog
function openCreateDialog() {
  isEditing.value = false;
  form.value = { status: 0, color: "#3b82f6" };
  dialog.value = true;
}

async function openEditDialog(project) {
  isEditing.value = true;
  dialog.value = true;

  try {
    const response = await useAPI("project/get-one", {
      method: "GET",
      params: { id: project.id },
    });
    const p = response.content;
    form.value = {
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      status: p.status,
      color: p.color ?? "#3b82f6",
      dueDate: p.dueDate ? new Date(p.dueDate) : null,
      userId: p.userId ?? null,
    };
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
  }
}

function closeDialog() {
  dialog.value = false;
  form.value = {};
  isEditing.value = false;
}

function confirmDelete(project) {
  projectToDelete.value = project;
  deleteDialog.value = true;
}
//#endregion

//#region CRUD
async function saveProject() {
  if (!form.value.name?.trim()) return;
  saving.value = true;
  try {
    await useAPI("project/create", { method: "POST", body: form.value });
    closeDialog();
    await fetchProjects();
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
  } finally {
    saving.value = false;
  }
}

async function editProject() {
  if (!form.value.name?.trim()) return;
  saving.value = true;
  try {
    await useAPI("project/edit", { method: "PUT", body: form.value });
    closeDialog();
    await fetchProjects();
  } catch (error) {
    console.error("Erro ao editar projeto:", error);
  } finally {
    saving.value = false;
  }
}

async function deleteProject() {
  deleting.value = true;
  try {
    await useAPI("project/delete", {
      method: "DELETE",
      params: { id: projectToDelete.value.id },
    });
    deleteDialog.value = false;
    projectToDelete.value = null;
    await fetchProjects();
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
  } finally {
    deleting.value = false;
  }
}
//#endregion

//#region fetch
async function fetchProjects() {
  loading.value = true;
  try {
    const response = await useAPI("project/filtered-and-paginated", {
      method: "POST",
      body: {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        search: search.value || undefined,
      },
    });
    projects.value = response.content.data;
    totalItems.value =
      response.content.totalCount ?? response.content.data.length;
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
  } finally {
    loading.value = false;
  }
}

async function getUsers() {
  try {
    const response = await useAPI("user/get-all-reduced", { method: "GET" });
    users.value = response.content;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
  }
}

function onSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchProjects();
  }, 400);
}

function changePage(page) {
  pagination.value.page = page;
  fetchProjects();
}
//#endregion

fetchProjects();
getUsers();
</script>
