<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ open: boolean; title: string; description?: string; confirmLabel?: string; danger?: boolean; confirmDisabled?: boolean }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" role="presentation" @mousedown.self="emit('close')">
      <section class="modal-panel" role="dialog" aria-modal="true" :aria-label="title">
        <button class="icon-button modal-close" type="button" :aria-label="$t('actions.close')" :title="$t('actions.close')" @click="emit('close')">
          <X :size="18" aria-hidden="true" />
        </button>
        <div class="eyebrow">CAIGE</div>
        <h2>{{ title }}</h2>
        <p v-if="description" class="modal-description">{{ description }}</p>
        <div class="modal-content"><slot /></div>
        <footer v-if="confirmLabel" class="modal-actions">
          <button class="button button-ghost" type="button" @click="emit('close')">{{ $t('actions.cancel') }}</button>
          <button class="button" :class="danger ? 'button-danger' : 'button-primary'" type="button" :disabled="confirmDisabled" @click="emit('confirm')">{{ confirmLabel }}</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
