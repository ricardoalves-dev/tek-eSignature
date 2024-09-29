<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import { computed, ref } from 'vue'
import { PDFDocumentProxy } from 'pdfjs-dist'

// Props
const props = defineProps<{
  pdfPath: string,
}>()

// Eventos
const emit = defineEmits<{ 
  (e: 'beforePrintPages'): void;
  (e: 'afterPrintPages'): void; 
  (e: 'onPrintPagesError', error: Error): void; 
}>()

// Reativas
const loadingPdfDoc = ref<boolean>(false);
const currentPage = ref<number>(0);
const pdfViewer = ref<HTMLDivElement>();
const pdfViewerContainer = ref<HTMLDivElement>();

// Computadas
const pdfPath = computed(() => new URL(props.pdfPath, import.meta.url).href);
//const pdfFileName = computed(() => pdfPath.value.split('/').pop());

let pdfDoc: PDFDocumentProxy;

onMounted(async () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
  pdfDoc = await getPdf();
  await printAllPages();
})

async function getPdf(): Promise<PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument(pdfPath.value);
  loadingTask.onProgress = (loaded: number, total: number) => (loadingPdfDoc.value = loaded !== total);
  return loadingTask.promise;
}

async function printAllPages() {
  currentPage.value = 1;
  emit('beforePrintPages');
  try {
    for (let pageIndex = 1; pageIndex <= pdfDoc.numPages; pageIndex++) {
      const pageCanvas = createPageCanvas(pageIndex);
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-wrapper';
      pageWrapper.appendChild(pageCanvas);
      pdfViewerContainer.value?.appendChild(pageWrapper);
      await printPage(pageIndex, pageCanvas);
    }
  } finally {
    emit('afterPrintPages');
  }
}

function createPageCanvas(pageNumber: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.className = 'pdf-page';
  canvas.id = `page-${pageNumber.toString()}`;

  return canvas;
}

async function printPage(pageNum: number, canvas: HTMLCanvasElement): Promise<void> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page!.getViewport({ scale: 3 });
  const outputScale = window.devicePixelRatio || 1;

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);

  if (pdfViewerContainer.value!.clientWidth < viewport.width) {
    canvas.style.width = Math.floor(viewport.width) * (pdfViewerContainer.value!.clientWidth / viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) * (pdfViewerContainer.value!.clientWidth / viewport.width) + 'px';
  }

  const transform = outputScale !== 1
    ? [outputScale, 0, 0, outputScale, 0, 0]
    : undefined;

  try {
    await page.render(
      {
        canvasContext: canvas.getContext('2d')!,
        transform,
        viewport,
      }).promise;
  } catch (error) {
    emit('onPrintPagesError', error instanceof Error ? error : new Error(String(error)));
  }
}

</script>

<template>
  <div id="pdf-viewer" ref="pdfViewer">
    <div id="pdf-viewer-container" ref="pdfViewerContainer"></div>
  </div>

</template>

<style>
#pdf-viewer {
  background-color: #fff;
  width: 100%;
  height: 100%;
}

#pdf-viewer-container {
  width: 95%;
  margin: 0 auto;
}

.pdf-page-wrapper {
  display: flex;
  justify-content: center;
  margin: 1rem;
}

.pdf-page {
  border: 1px solid rgba(0, 0, 0, 0.2);  
}

.pdf-toolbar {
  background-color: #292b2b;
  display: none;
  justify-content: space-between;
  padding: .8rem;
  position: fixed;
  width: 100%;
  color: #fff;
}
</style>
