<script setup lang="ts">
import SignaturePad, { PointGroup } from 'signature_pad';
import { ref } from 'vue';

const { width = 500, height = 200, signatureType = 'svg' } = defineProps<{
    width: number,
    height: number,    
    signatureType: 'jpeg' | 'png' | 'svg',
}>();

const emit = defineEmits<{
    (e: 'onSave', dataURL: string): void
}>()

const canvas = ref<HTMLCanvasElement | null>(null);
let undoPoints: PointGroup[] = [];
let signaturePad: SignaturePad;

onMounted(() => {
    signaturePad = new SignaturePad(canvas.value!);
    signaturePad.clear();
    signaturePad.on();
    signaturePad.addEventListener('beginStroke', () => {
        undoPoints =[]
    });
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
})

onUnmounted(() => {
    signaturePad.off();
    window.removeEventListener('resize', resizeCanvas);
})

function clearCanvas() {
    undoPoints = signaturePad.toData();
    signaturePad.clear();
}

function undoAction() {
    const data = signaturePad.toData();
    if (data.length === 0) {
        return
    }
    
    undoPoints.push(data.pop()!);
    signaturePad.fromData(data);
    
}

function redoAction() {    
    if(undoPoints.length === 0) {
        return;
    }

    const data = signaturePad.toData();    
    data.push(undoPoints.pop()!);    
    signaturePad.fromData(data);
}

function resizeCanvas() {
  var ratio =  Math.max(window.devicePixelRatio || 1, 1);
  canvas.value!.width = canvas.value!.offsetWidth * ratio;
  canvas.value!.height = canvas.value!.offsetHeight * ratio;
  canvas.value!.getContext("2d")!.scale(ratio, ratio);

  signaturePad.clear();
}

function saveSignature() {
    var type;
    switch (signatureType) {
        case 'jpeg':
            type = 'image/jpeg';
            break;
        case 'png':
            type = '';
            break;
        case 'svg':
            type = 'image/svg+xml';
            break;
    }
    
    emit('onSave', signaturePad.toDataURL(type));        
}

</script>

<template>
    <v-container fluid>
    <v-card :width="width" class="mx-auto">
        <v-toolbar color="primary" title="Assinatura Eletrônica" density="compact"></v-toolbar>
        <v-card-text :style="`height: ${height}px`">
            <canvas ref="canvas" id="signature-canvas"></canvas>
        </v-card-text>
        <v-card-actions :style="{ backgroundColor: $vuetify.theme.current.colors.primary, minHeight: 0 }" class="signature-actions">
            <v-spacer></v-spacer>                        
            <v-btn density="compact" icon="mdi-undo" color="white" @click.stop="undoAction" />
            <v-btn density="compact" icon="mdi-redo" color="white" @click.stop="redoAction" />            
            <v-btn density="compact" icon="mdi-broom" color="white" @click.stop="clearCanvas" />
            <v-btn density="compact" icon="mdi-check" color="white" @click.stop="saveSignature"/>
        </v-card-actions>
    </v-card>
</v-container>
</template>

<style>
#signature-canvas {
    width: 100%;
    height: 100%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 5px;
}
</style>