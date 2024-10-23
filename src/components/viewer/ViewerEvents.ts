export type ViewerEvents = {
    (e: "beforePrintPages"): void;
    (e: "afterPrintPages"): void;
    (e: "onPrintPagesError", error: Error): void;
    (e: "onResize"): void;
}