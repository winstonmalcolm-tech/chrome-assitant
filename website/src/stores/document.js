import {ref} from 'vue';
import { defineStore } from 'pinia';

export const useDocumentStore = defineStore('document', () => {
  const documents = ref([])
  const currentDocument = ref(null)

  const setCurrentDocument = (doc) => {
    currentDocument.value = doc
    localStorage.setItem('currentDocument', JSON.stringify(doc))
  }
  
  const loadCurrentDocument = () => {
    const saved = localStorage.getItem('currentDocument')
    if (saved) {
      currentDocument.value = JSON.parse(saved)
    }
  }

  return { documents, currentDocument, setCurrentDocument, loadCurrentDocument };
})