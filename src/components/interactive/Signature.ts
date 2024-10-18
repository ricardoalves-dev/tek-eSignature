import { SignatureCorner } from './SignatureCorner';

export type CornersPositions = {
    topLeft: SignatureCorner,
    topRight: SignatureCorner,
    bottomRight: SignatureCorner,
    bottomLeft: SignatureCorner,
}

export class Signature {
    corners: CornersPositions;
    img: HTMLImageElement;    
    private _currentWidth: number = 0;
    private _currentHeight: number = 0;

    constructor() {  
        this.img = new Image();        
        this.corners = {
            topLeft: new SignatureCorner(),
            topRight: new SignatureCorner(),
            bottomRight: new SignatureCorner(),
            bottomLeft: new SignatureCorner(),
        };
        this.corners.topLeft.cursor = 'nw-resize';
        this.corners.topRight.cursor = 'ne-resize';
        this.corners.bottomRight.cursor = 'se-resize';
        this.corners.bottomLeft.cursor = 'sw-resize';        
    }

    draw(canvas2dContext: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, withCorners: boolean = true) {                               
        canvas2dContext.drawImage(this.img, x, y, width, height);       
        this._currentWidth = width;
        this._currentHeight = height;

        if (!withCorners) {
            return;
        }
                
        this.corners.topLeft.x = x;
        this.corners.topLeft.y = y;        
        this.corners.topLeft.draw(canvas2dContext);

        this.corners.topRight.x = x + width;
        this.corners.topRight.y = y;        
        this.corners.topRight.draw(canvas2dContext);

        this.corners.bottomRight.x = x + width;
        this.corners.bottomRight.y = y + height;        
        this.corners.bottomRight.draw(canvas2dContext);

        this.corners.bottomLeft.x = x;
        this.corners.bottomLeft.y = y + height;        
        this.corners.bottomLeft.draw(canvas2dContext);

        this.corners.topLeft.lineTo(canvas2dContext, this.corners.topRight.x, this.corners.topRight.y);
        this.corners.topRight.lineTo(canvas2dContext, this.corners.bottomRight.x, this.corners.bottomRight.y);
        this.corners.bottomRight.lineTo(canvas2dContext, this.corners.bottomLeft.x, this.corners.bottomLeft.y);
        this.corners.bottomLeft.lineTo(canvas2dContext, this.corners.topLeft.x, this.corners.topLeft.y);      
    }

    isMouseOver(mouseX: number, mouseY: number): boolean {        
        return (mouseX > this.corners.topLeft.x && mouseX < this.corners.bottomRight.x) && (mouseY > this.corners.topLeft.y && mouseY < this.corners.bottomRight.y);
    }

    get currentWidth() : number {
        return this._currentWidth;
    }

    get currentHeight() : number {
        return this._currentHeight;
    }
}