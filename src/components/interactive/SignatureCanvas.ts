import { SignatureCorner } from './SignatureCorner';
import { Signature, CornersPositions } from './Signature';

type Point = {
    x: number,
    y: number,
}

export class SignatureCanvas {
    private canvas: HTMLCanvasElement;    
    private canvas2dContext: CanvasRenderingContext2D;
    private contextColor: string = '#3183c8';
    private canvasWidthRatio: number;
    private canvasHeightRatio: number;    
    private signature: Signature;    
    private draggingSignature: boolean = false;
    private resizingSignature: boolean = false;
    private resizingCorner: keyof CornersPositions | undefined;
    private lastMousePosition: Point = { x: 0, y: 0 };

    constructor(readonly width: number, 
                readonly height: number, 
                readonly styleWidth: string, 
                readonly styleHeight: string) {
        
        this.canvas = document.createElement('canvas');         
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = styleWidth;
        this.canvas.style.height = styleHeight;
        this.canvasWidthRatio = this.canvas.width / parseInt(this.canvas.style.width);
        this.canvasHeightRatio = this.canvas.height / parseInt(this.canvas.style.height);  
        this.canvas.addEventListener('mousemove', this.mouseMouveHandler.bind(this));
        this.canvas.addEventListener('mousedown', this.mouseDownHandler.bind(this));
        this.canvas.addEventListener('mouseup', this.mouseUpHandler.bind(this));        
        
        this.canvas2dContext = this.canvas.getContext('2d')!;        

        this.signature = new Signature();    
    } 

    drawSignature(imgSrc: string, x: number, y: number, width: number, height: number) {
        this.clearSignature();
        this.canvas2dContext.strokeStyle = this.contextColor;
        this.canvas2dContext.fillStyle = this.contextColor;
        
        this.signature.img.crossOrigin = 'anonymous';
        this.signature.img.src = imgSrc;
        this.signature.img.onload = () => {            
            this.signature.draw(this.canvas2dContext, x, y, width, height);                                         
        }        
    }

    clearSignature() {
        this.canvas2dContext.clearRect(0, 0, this.canvas.width, this.canvas.height);        
    }

    private mouseMouveHandler(event: MouseEvent) {   
        const { x, y } = this.getMouseXYInCanvasScale(event.clientX, event.clientY);                

        if (this.draggingSignature) {
            this.moveSignature(x - this.lastMousePosition.x, y - this.lastMousePosition.y);
            this.lastMousePosition.x = x;
            this.lastMousePosition.y = y;

            return;
        }

        if (this.resizingSignature) {
            this.resizeSignature(x, y);
            this.lastMousePosition.x = x;
            this.lastMousePosition.y = y;

            return;
        }

        const focusedCorner: SignatureCorner | undefined = Object.values(this.signature.corners).find(corner => corner.isMouseOver(x, y));
        this.canvas.style.cursor = 'default';
        if (focusedCorner) {
            this.canvas.style.cursor = focusedCorner.cursor;
        } 
        else if (this.signature.isMouseOver(x, y)) {                    
            this.canvas.style.cursor = 'move';
        }         
    }

    private moveSignature(mouseXInCanvasScale: number, mouseYINCanvasScale: number) {             
        this.clearSignature(); 
        this.signature.draw(this.canvas2dContext, this.signature.corners.topLeft.x + mouseXInCanvasScale, this.signature.corners.topLeft.y + mouseYINCanvasScale, this.signature.currentWidth, this.signature.currentHeight);                
    }    

    private resizeSignature(mouseXInCanvasScale: number, mouseYINCanvasScale: number) {
        if (!this.resizingCorner) {
            return;
        }
        
        this.clearSignature();          
        switch(this.resizingCorner) {
            case 'topLeft':                  
                this.signature.draw(this.canvas2dContext, mouseXInCanvasScale, mouseYINCanvasScale, this.signature.corners.bottomRight.x - mouseXInCanvasScale, this.signature.corners.bottomRight.y - mouseYINCanvasScale);
                return;
            
            case 'topRight':   
                this.signature.draw(this.canvas2dContext, this.signature.corners.topLeft.x, mouseYINCanvasScale, mouseXInCanvasScale - this.signature.corners.bottomLeft.x, this.signature.corners.bottomLeft.y - mouseYINCanvasScale);
                return;

            case 'bottomRight':
                this.signature.draw(this.canvas2dContext, this.signature.corners.topLeft.x, this.signature.corners.topLeft.y, mouseXInCanvasScale - this.signature.corners.topLeft.x, mouseYINCanvasScale - this.signature.corners.topLeft.y);
                return;

            case 'bottomLeft':
                this.signature.draw(this.canvas2dContext, mouseXInCanvasScale, this.signature.corners.topLeft.y, this.signature.corners.topRight.x - mouseXInCanvasScale, mouseYINCanvasScale - this.signature.corners.topRight.y);
                return;
        }  
        
    }

    private mouseDownHandler(event: MouseEvent) {
        this.clearSignature();
        const { x, y } = this.getMouseXYInCanvasScale(event.clientX, event.clientY);
        let focusedCorner: keyof CornersPositions | undefined = Object.entries(this.signature.corners).find(keyValue => keyValue[1].isMouseOver(x, y))?.[0] as keyof CornersPositions;        

        if(focusedCorner || this.signature.isMouseOver(x, y)) {
            this.signature.draw(this.canvas2dContext, this.signature.corners.topLeft.x, this.signature.corners.topLeft.y, this.signature.currentWidth, this.signature.currentHeight, true);
            this.lastMousePosition.x = x;
            this.lastMousePosition.y = y;
            this.resizingSignature = focusedCorner !== undefined;      
            this.resizingCorner =  focusedCorner;       
            this.draggingSignature = !this.resizingSignature;
            
            return;
        }
        
        this.signature.draw(this.canvas2dContext, this.signature.corners.topLeft.x, this.signature.corners.topLeft.y, this.signature.currentWidth, this.signature.currentHeight, false);                    
    }

    private mouseUpHandler(event: MouseEvent) {
        this.draggingSignature = false;
        this.resizingSignature = false;
    }

    private getMouseXYInCanvasScale(mouseX: number, mouseY: number): Point {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: (mouseX - rect.x) * this.canvasWidthRatio,
            y: (mouseY - rect.top) * this.canvasHeightRatio,
        };
    }

    get(): HTMLCanvasElement {
        return this.canvas;
    }

    getSignature(): Signature {
        return this.signature;
    }
}