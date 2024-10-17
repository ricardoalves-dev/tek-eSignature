<script setup lang="ts">
import { SignatureType } from './SignatureType';
import SignaturePad, { PointGroup } from 'signature_pad';
import { ref } from 'vue';
import { ISignatureImage } from './ISignatureImage';

const { width = 400, 
        height = 120, 
        signatureType = 'svg' 
        } = defineProps<{
                            width?: number,
                            height?: number,    
                            signatureType?: SignatureType,
                        }>();

const emit = defineEmits<{
    (e: 'onSave', signatureImage: ISignatureImage): void,
    (e: 'onCancel'): void,
}>()

const tabModel = ref<string>('draw');
const canvas = ref<HTMLCanvasElement | null>(null);
let undoPoints: PointGroup[] = [];
let signaturePad: SignaturePad;

onMounted(() => {
    signaturePad = new SignaturePad(canvas.value!);    
    signaturePad.clear();
    signaturePad.on();
    signaturePad.addEventListener('beginStroke', () => {
        undoPoints = []
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
    
    emit('onSave', {
        width: width,
        height: height,
        type: signatureType,
        dataURL: signaturePad.toDataURL(type),
    });        
}
</script>

<template>
    <v-container class="fill-height justify-center">        
        <v-sheet width="fit-content" height="fit-content" :elevation="3" class="px-5" rounded>      
            <v-toolbar height="40" color="white">
                <v-tabs density="compact" v-model="tabModel" color="primary">
                    <v-tab value="draw"> <v-icon size="x-large"> mdi-draw </v-icon> </v-tab>                                                
                </v-tabs>
                <v-spacer></v-spacer>
                <v-btn size="small" density="comfortable" icon="mdi-arrow-u-left-top" @click.stop="undoAction" />
                <v-btn size="small" density="comfortable" icon="mdi-arrow-u-right-top" @click.stop="redoAction" />            
                <v-btn size="small" density="comfortable" icon="mdi-eraser" @click.stop="clearCanvas" />    
            </v-toolbar>                         
            <v-tabs-window v-model="tabModel">
                <v-tabs-window-item class="py-2" value="draw" id="draw-tab">
                    <v-sheet id="draw-tab-content" :width="width" :height="height">
                        <canvas ref="canvas" id="signature-canvas" :width="width" :height="height"></canvas>                  
                    </v-sheet>                                                   
                </v-tabs-window-item>
            </v-tabs-window>               
            <div class="pb-2 d-flex justify-end">                               
                <v-btn class="mr-2" size="small" text="Cancelar" color="error" variant="text" @click.stop="$emit('onCancel')"></v-btn>
                <v-btn size="small" text="Confirmar" variant="elevated" color="success" @click.stop="saveSignature"></v-btn>    
            </div>                
        </v-sheet>
</v-container>
</template>

<style scoped>
#signature-canvas {    
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    position: relative;
    width: 100%;
    height: 100%;
    cursor: url('./assets/pencil.svg') 3 28, auto;
}

#draw-tab-content {
    position: relative;
}

#draw-tab-content::after {    
    content: "";
    position: absolute;
    width: 90%;
    background-color: rgba(0, 0, 0, 0.2);
    height: 1px;
    left: 50%;
    bottom: 20%;
    transform: translateX(-50%);
    pointer-events: none;
}
</style>