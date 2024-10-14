<script setup lang="ts">
import PdfViewer from './PdfViewer.vue';
import THintButton from "tek-components-vue3-ts/src/components/button/THintButton.vue";
import ESignature from '../signature/ESignature.vue';
import { ISignatureImage } from '../signature/ISignatureImage';
import { nextTick, ref } from 'vue';
import { InteractiveElement } from '../interactive/InteractiveElement';

defineProps<{
  pdfPath: string;  
}>();

defineEmits<{
    (e: 'onSignatureSaved'): void;
}>();

const showSignaturePad = ref(false);
const viewerRef = ref();
const isSigned = ref(false);

function onSaveSignature(signature: ISignatureImage) {
    showSignaturePad.value = false;    
    const lastPageCanvas = viewerRef.value.pagesCanvas[viewerRef.value.pagesCanvas.length - 1];
    const div = document.createElement('div');        
    new InteractiveElement(div, true, true, {
        afterDelete: () => {
            isSigned.value = false;
        }
    });   
    const img = document.createElement('img');
    img.setAttribute('src', signature.dataURL);       
    img.style.width = '100%';
    img.style.height = '100%';
    div.appendChild(img);
    lastPageCanvas.parentElement.appendChild(div); 
    
    isSigned.value = true;
    nextTick(() => window.scrollTo(0, document.body.scrollHeight));
}
</script>

<template>
    <PdfViewer 
        ref="viewerRef" 
        :pdf-path="pdfPath"
    >
        <template #toolbarButtons>
            <THintButton 
                hint="Assinar" 
                hint-position="bottom" 
                icon="mdi-file-sign" 
                variant="text" 
                color="white" 
                density="compact" 
                @click="showSignaturePad = true"
                :disabled="isSigned || viewerRef?.loadingPdfDoc"
            />
            <v-divider vertical class="mx-1"></v-divider>
        </template>        
    </PdfViewer>
    <v-dialog v-model="showSignaturePad">
        <ESignature
            :width="400"
            :height="100"
            @on-cancel="showSignaturePad = false"
            @on-save="onSaveSignature" 
        />        
    </v-dialog>    

</template>