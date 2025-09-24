<!-- components/Editor.vue -->
<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const editor = ref(null)

onMounted(() => {
  editor.value = new Editor({
    extensions: [StarterKit],
    content: '<p>Hello Winston, start writing here…</p>',
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.editor-content {
  border: 1px solid #ccc;
  padding: 1rem;
  min-height: 200px;
}
</style>