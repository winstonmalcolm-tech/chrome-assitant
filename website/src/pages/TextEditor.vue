<script setup>
  import TipTap from '@/components/TipTap.vue';
  import { ref } from 'vue'

  const drawer = ref(true)
  const rail = ref(true)
  const rightRail = ref(true);
  const rightDrawer = ref(true);
  const modalOpen = ref(false)
  const newDocumentModalOpen = ref(false);

</script>

<template>
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
      >
        <v-list>
          <v-list-item
            prepend-avatar="/alinea_icon.png"
            title="Alinea AI"
          >
            <template v-slot:append>
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                @click.stop="rail = !rail"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-view-dashboard-outline"
            title="Dashboard"
            value="dashboard"
            to="/dashboard"
          ></v-list-item>

          <v-list-item
          prepend-icon="mdi-file-document-outline"
          title="Documents"
          value="documents"
          @click="modalOpen = true"
          :active="false"
        ></v-list-item>

          <v-list-item
          prepend-icon="mdi-plus"
          title="New Document"
          value="newdocument"
          @click="newDocumentModalOpen = true"
          :active="false"
        ></v-list-item>
          
        </v-list>
      </v-navigation-drawer>

      <v-navigation-drawer
        v-model="rightDrawer"
        :rail="rightRail"
        permanent
        @click="rightRail = false"
        location="right"
      >
        <v-list>
          <v-list-item
            title="References"
          >
            <template v-slot:prepend>
              <v-btn
                :icon= "rightRail ? 'mdi-bookmark' : 'mdi-chevron-right'"
                variant="text"
                @click.stop="rightRail = !rightRail"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>


        
      </v-navigation-drawer>
      
      <v-main>
        <TipTap />
      </v-main>

      <!-- New Document Modal  -->
      <v-dialog v-model="newDocumentModalOpen" width="350">
        <v-card>
          <v-card-title>New Document</v-card-title>
          <v-card-text>
            <h1>HEY</h1>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="newDocumentModalOpen = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Small Modal Dialog for document list -->
      <v-dialog v-model="modalOpen" width="350">
        <v-card>
          <v-card-title>Past Documents</v-card-title>
          <v-card-text>
            <h1>List of past documents</h1>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="modalOpen = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
    </v-layout>
</template>
