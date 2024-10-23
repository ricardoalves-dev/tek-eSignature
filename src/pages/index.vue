<template>      
  <v-container fluid class="fill-height" v-if="pdfError">
    <v-row no-gutters>
      <v-col>
        <v-empty-state          
          image="https://cdn.vuetifyjs.com/docs/images/components/v-empty-state/connection.svg"
          text="Ocorreu um erro ao carregar o arquivo PDF. Tente novamente mais tarde ou entre em contato com a Tek-System"
          title="Ops... Algo deu errado"        
        ></v-empty-state>
      </v-col>
    </v-row>
  </v-container> 
  <SignaturePdfViewer    
    pdf-path="../../assets/teste.pdf"   
    @on-print-pages-error="pdfError = true"
  />
    
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const pdfError = ref(false);
</script>
