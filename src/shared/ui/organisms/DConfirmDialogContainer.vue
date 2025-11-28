<template>
  <DConfirmDialog
    v-model="state.show"
    :title="state.title"
    :message="state.message"
    :variant="state.variant"
    :confirm-text="state.confirmText"
    :cancel-text="state.cancelText"
    :loading-text="state.loadingText"
    :loading="state.loading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { useConfirm } from '~shared/composables/useConfirm'
import DConfirmDialog from '~shared/ui/molecules/DConfirmDialog.vue'

const { state, handleConfirm, handleCancel } = useConfirm()
</script>
