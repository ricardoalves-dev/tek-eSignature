import { SignatureCorner } from './SignatureCorner';
import { Signature } from './Signature';

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
    private p: Point = {x: 0, y: 0};

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
        this.canvas2dContext.strokeStyle = this.contextColor;
        this.canvas2dContext.fillStyle = this.contextColor;

        this.signature = new Signature();    
    } 

    drawSignature(imgSrc: string, x: number, y: number, width?: number, height?: number) {
        this.clearSignature();
        this.signature.img.crossOrigin = 'anonymous';
        this.signature.img.src = imgSrc;
        this.signature.img.onload = () => {            
            this.signature.draw(this.canvas2dContext, x, y, this.signature.img.width, this.signature.img.height);                                         
        }        
    }

    clearSignature() {
        this.canvas2dContext.clearRect(0, 0, this.canvas.width, this.canvas.height);        
    }

    private mouseMouveHandler(event: MouseEvent) {   
        const { x, y } = this.getMouseXYInCanvasScale(event.clientX, event.clientY);        
        const focusedCorner: SignatureCorner | undefined = Object.values(this.signature.corners).find(corner => corner.isMouseOver(x, y));

        if (this.draggingSignature) {
            this.moveSignature(x - this.p.x, y - this.p.y);
            this.p.x = x;
            this.p.y = y;
            return;
        }

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
        this.signature.draw(this.canvas2dContext, this.signature.corners.topLeft.x + mouseXInCanvasScale, this.signature.corners.topLeft.y + mouseYINCanvasScale, this.signature.img.width, this.signature.img.height);        
        console.log(this.signature.img.src, this.signature.corners.topLeft.x, this.signature.corners.topLeft.y, this.signature.img.width, this.signature.img.height);
    }    

    private mouseDownHandler(event: MouseEvent) {
        this.clearSignature();
        const { x, y } = this.getMouseXYInCanvasScale(event.clientX, event.clientY);
        if (!this.signature.isMouseOver(x, y)) {
            this.signature.draw(this.canvas2dContext, this.signature.corners.topLeft.x, this.signature.corners.topLeft.y, this.signature.img.width, this.signature.img.height, false);
            return;
        }

        this.signature.draw(this.canvas2dContext, this.signature.corners.topLeft.x, this.signature.corners.topLeft.y, this.signature.img.width, this.signature.img.height, true);
        this.p.x = x;
        this.p.y = y;
        this.draggingSignature = true;
    }

    private mouseUpHandler(event: MouseEvent) {
        this.draggingSignature = false;
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