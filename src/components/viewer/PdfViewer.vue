<script setup lang="ts">
import * as pdfjsLib from "pdfjs-dist";
import { computed, ref } from "vue";
import { PDFDocumentProxy } from "pdfjs-dist";
import TButton from "tek-components-vue3-ts/src/components/button/TButton.vue";
import THintButton from "tek-components-vue3-ts/src/components/button/THintButton.vue";
import { useRouter } from "vue-router";
import { ViewerEvents } from "./ViewerEvents";

// Props
const props = defineProps<{
  pdfPath: string;
}>();

// Eventos
const emit = defineEmits<ViewerEvents>();

// Reativas
const pdfViewer = ref<HTMLDivElement>();
const pdfViewerContainer = ref<HTMLDivElement>();
const loadingPdfDoc = ref<boolean>(true);
const currentPage = ref<number>(0);
const numberOfPages = ref<number>(0);
const pdfPath = computed(() => new URL(props.pdfPath, import.meta.url).href);
const pdfFileName = computed(() => pdfPath.value.split("/").pop());
const router = useRouter();
const canvasVisualSizeDivider = 1.5;
const pagesCanvas = ref<HTMLCanvasElement[]>([]);
const viewports = {
  default: {
    width: 0,
    height: 0,
  },
  initial: {
    width: 0,
    height: 0,
  }
};

let pdfDoc: PDFDocumentProxy;
const mask = "###############";
let currentPageScale = ref(2.5);
const outputScale = window.devicePixelRatio || 1;

onMounted(async () => {
  loadingPdfDoc.value = true;

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).href;
  pdfDoc = await getPdf();

  const page = await pdfDoc.getPage(1);
  let vp = page.getViewport({ scale: 1 });
  viewports.default.width = vp.width;
  viewports.default.height = vp.height;

  vp = page.getViewport({ scale: currentPageScale.value });
  viewports.initial.width = vp.width;
  viewports.initial.height = vp.height;  

  numberOfPages.value = pdfDoc.numPages;
  currentPage.value = 1;
  pagesCanvas.value = [];  

  if (await checkViewportBiggerThanScreen()) {
    await fitPagesToScreen();
  } else {
    await printAllPages();
  }

  loadingPdfDoc.value = false;
});

async function getPdf(): Promise<PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument(pdfPath.value);

  return loadingTask.promise;
}

async function printAllPages() {
  emit("beforePrintPages");
  try {
    for (let pageIndex = 1; pageIndex <= pdfDoc.numPages; pageIndex++) {
      const pageCanvas = document.getElementById(`page-${pageIndex}`)
        ? (document.getElementById(`page-${pageIndex}`) as HTMLCanvasElement)
        : createPageCanvas(pageIndex);

      await printPage(pageIndex, pageCanvas);
    }
  } finally {
    emit("afterPrintPages");
  }
}

function createPageCanvas(pageNumber: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.className = "pdf-page";
  canvas.id = `page-${pageNumber.toString()}`;

  createPageCanvasWrapper(canvas);

  pagesCanvas.value.push(canvas);
  return canvas;
}

function createPageCanvasWrapper(canvas: HTMLCanvasElement) {
  const pageCanvasWrapper = document.createElement("div");
  pageCanvasWrapper.className = "pdf-page-wrapper";
  pageCanvasWrapper.appendChild(canvas);
  pdfViewerContainer.value!.appendChild(pageCanvasWrapper);
}

async function fitPagesToScreen() {
  const page = await pdfDoc.getPage(1);
  const viewportScaleOne = page!.getViewport({ scale: 1 });
  const maxViewport =
    (pdfViewer.value!.clientWidth * canvasVisualSizeDivider) / outputScale;
  const maxScale = Math.floor(maxViewport / viewportScaleOne.width);
  currentPageScale.value = maxScale;

  await printAllPages();
  
  emit('onResize');
}

async function checkViewportBiggerThanScreen(): Promise<boolean> {
  const page = await pdfDoc.getPage(1);
  const viewport = page!.getViewport({ scale: currentPageScale.value });

  return (viewport.width * outputScale) / canvasVisualSizeDivider > pdfViewer.value!.clientWidth;
}

async function printPage(
  pageNum: number,
  canvas: HTMLCanvasElement
): Promise<void> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page!.getViewport({ scale: currentPageScale.value });  

  // Resolução
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);

  // Tamanho visual do canvas
  canvas.style.width = `${canvas.width / canvasVisualSizeDivider}px`;
  canvas.style.height = `${canvas.height / canvasVisualSizeDivider}px`;

  const transform =
    outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

  try {
    await page.render({
      canvasContext: canvas.getContext("2d")!,
      transform,
      viewport,
    }).promise;
  } catch (error) {
	loadingPdfDoc.value = false;
    emit(
      "onPrintPagesError",
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

function navigateToPreviousPage() {
  currentPage.value--;
  navigateToPage(currentPage.value);
}

function navigateToNextPage() {
  currentPage.value++;
  navigateToPage(currentPage.value);
}

function navigateToPage(pageNumber: number) {
  if (pageNumber < 1) {
    pageNumber = 1;
  } else if (pageNumber > numberOfPages.value) {
    pageNumber = numberOfPages.value;
  }

  currentPage.value = pageNumber;
  router.push(`#page-${currentPage.value}`);
}

async function zoomIn() {
  currentPageScale.value *= 4 / 3;
  await printAllPages();
  emit('onResize');
}

async function zoomOut() {
  currentPageScale.value *= 2 / 3;
  await printAllPages();
  emit('onResize');
}

defineExpose({
  pagesCanvas,
  loadingPdfDoc,
  viewports,
});

</script>

<template>
  <v-toolbar color="#323639" id="pdf-viewer-toolbar" height="40" class="pa-2">
    <v-toolbar-title> {{ pdfFileName }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-divider vertical class="mx-1"></v-divider>
    <div>
      <TButton
        density="compact"
        variant="text"
        icon="mdi-menu-left"
        color="white"
        :disabled="currentPage === 1"
        @click="navigateToPreviousPage"
      ></TButton>
      <input
        id="pdf-viewer-toolbar-current-page"
        type="tel"
        v-mask="mask"
        class="pa-1"
        style="color: white"
        min="1"
        :max="numberOfPages"
        v-model="currentPage"
        :disabled="loadingPdfDoc"
        @change="navigateToPage(currentPage)"
      />
      <span> / {{ numberOfPages }}</span>
      <TButton
        density="compact"
        variant="text"
        icon="mdi-menu-right"
        color="white"
        :disabled="currentPage === numberOfPages || loadingPdfDoc"
        @click="navigateToNextPage"
      ></TButton>
    </div>
    <v-divider vertical class="mx-1"></v-divider>
    <v-item-group>
      <THintButton
        hint="Aumentar zoom"
        hint-position="bottom"
        density="compact"
        variant="text"
        icon="mdi-magnify-plus-outline"
        color="white"
        :disabled="currentPageScale > 5 || loadingPdfDoc"
        @click="zoomIn"
      ></THintButton>
      <THintButton
        hint="Diminuir zoom"
        hint-position="bottom"
        density="compact"
        variant="text"
        icon="mdi-magnify-minus-outline"
        color="white"
        :disabled="currentPageScale < 0.5 || loadingPdfDoc"
        @click="zoomOut"
      ></THintButton>
      <THintButton
        hint="Ajustar a tela"
        hint-position="bottom"
        density="compact"
        variant="text"
        icon="mdi-fit-to-screen-outline"
        color="white"
        :disabled="loadingPdfDoc"
        @click="fitPagesToScreen"
      ></THintButton>
    </v-item-group>
    <v-divider vertical class="mx-1"></v-divider>
    <slot name="toolbarButtons"></slot>
  </v-toolbar>
  <v-progress-linear
    indeterminate
    class="pt-15"
    color="primary"
    v-if="loadingPdfDoc"
  ></v-progress-linear>

  <div id="pdf-viewer" ref="pdfViewer">
    <div
      id="pdf-viewer-container"
      ref="pdfViewerContainer"
      :style="loadingPdfDoc ? 'visibility: hidden' : ''"
    ></div>
  </div>
</template>

<style>
html {
  overflow-x: auto;
}

#pdf-viewer {  
  background-color: #525659;
  width: 100%;
  height: 100%;
  padding-top: 3.5rem;
}

#pdf-viewer-toolbar {
  position: fixed;
  top: 0;
  z-index: 99;
  font-size: 0.8rem;
  color: #fff;
}

#pdf-viewer-toolbar-current-page {
  height: 1.5rem;
  width: 2rem;
  text-align: center;
  background-color: #292b2b;
  border: 1px solid #fff;
  border-radius: 5px;
}

#pdf-viewer-container {
  width: fit-content;
  margin: 0 auto;
}

.pdf-page-wrapper {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  position: relative;
}

.pdf-page {
  border: 1px solid rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: 0px 0px 14px 6px rgba(59, 59, 59, 1);
  -moz-box-shadow: 0px 0px 14px 6px rgba(59, 59, 59, 1);
  box-shadow: 0px 0px 14px 6px rgba(59, 59, 59, 1);
}

.pdf-toolbar {
  background-color: #292b2b;
  display: none;
  justify-content: space-between;
  padding: 0.8rem;
  position: fixed;
  width: 100%;
  color: #fff;
}
</style>
