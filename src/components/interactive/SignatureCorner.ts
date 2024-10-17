export class SignatureCorner {
    x: number = 0;
    y: number = 0;
    radius: number = 5;
    cursor: string = 'default';
    isMouseOver: (mouseX: number, mouseY: number) => boolean;
        
    constructor() {
        this.isMouseOver = ((mouseX: number, mouseY: number) => {
            const distanceFromCenter = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
            return distanceFromCenter <= this.radius;
        })
    }

    draw(canvasContext: CanvasRenderingContext2D) {
        canvasContext.beginPath();        
        canvasContext.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        canvasContext.closePath();
        canvasContext.fill();
    }

    lineTo(canvasContext: CanvasRenderingContext2D, x: number, y: number) {
        canvasContext.beginPath();
        canvasContext.moveTo(this.x, this.y);
        canvasContext.lineTo(x, y);
        canvasContext.closePath();
        canvasContext.stroke();
    }
}