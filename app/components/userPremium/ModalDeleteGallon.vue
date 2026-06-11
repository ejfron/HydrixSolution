 <template>
  <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-semibold mb-2">
        Delete Gallon Type
      </h3>

      <p class="text-gray-600 mb-6">
        Are you sure you want to delete this gallon type?
        This action cannot be undone.
      </p>

      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 border rounded-md"
          @click="showDeleteModal = false"
        >
          Cancel
        </button>

        <button
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          @click="confirmDelete"
        >
          Delete
        </button>
      </div>
    </div>
  </div>


</template>

<script setup lang="ts">

const props = defineProps<{
  showDeleteModal: boolean;
  confirmDelete: () => void;
  gallonId: number;
}>();



</script>