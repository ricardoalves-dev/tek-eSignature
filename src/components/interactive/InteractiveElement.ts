import interact from 'interactjs';

type Position = {
  x: number,
  y: number,
}

type CornerPosition = {
  y: 'top' | 'bottom',
  x: 'left' | 'right',
}

export class InteractiveElement {
  private _position: Position = { x: 0, y: 0 };

  constructor(readonly element: HTMLElement, readonly draggable: boolean, readonly resizable: boolean, readonly callback: { afterDelete: () => void }) {
    this.setElementStyle();

    if (draggable) {
      this.configureDraggable();
    }

    if (resizable) {
      this.configureResazible();
    }

    this.element.appendChild(this.createCorner({ x: 'left', y: 'top' }));
    this.element.appendChild(this.createCorner({ x: 'right', y: 'top' }));
    this.element.appendChild(this.createCorner({ x: 'left', y: 'bottom' }));
    this.element.appendChild(this.createCorner({ x: 'right', y: 'bottom' }));
    this.element.appendChild(this.createCloseButton());
  }

  private setElementStyle() {
    const style = this.element.style;
    style.position = 'absolute';
    style.minWidth = '35px';
    style.minHeight = '35px';
    style.bottom = '0';
    style.right = '0';
    style.border = '1px solid rgba(0, 0, 0, 0.2)';
    this.element.setAttribute('tabindex', '0');

    const showDetails = () => {
      style.border = '1px solid rgba(0, 0, 0, 0.2)';
      document.querySelectorAll('.corner').forEach((corner) => (corner as HTMLDivElement).style.borderColor = 'black');
      document.getElementById('delete-interactive-element')!.style.display = 'block';
    };

    const hideDetails = (e: MouseEvent | FocusEvent) => {
      if (e.relatedTarget === document.getElementById('delete-interactive-element')) {
        return;
      }

      style.border = '1px solid transparent';
      document.querySelectorAll('.corner').forEach((corner) => (corner as HTMLDivElement).style.borderColor = 'transparent');
      document.getElementById('delete-interactive-element')!.style.display = 'none';
    };

    this.element.addEventListener('mouseenter', showDetails);
    this.element.addEventListener('mouseleave', hideDetails);
    this.element.addEventListener('focus', showDetails);
    this.element.addEventListener('blur', hideDetails);
  }

  private configureDraggable() {
    interact(this.element).draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrict({
          restriction: 'parent',
          elementRect: { top: 0, right: 1, left: 0, bottom: 1 }, // Nao pode sair do elemento pai    
        })
      ],
      onmove: (event) => {
        const target = event.target as HTMLElement;
        this._position.x += event.dx;
        this._position.y += event.dy;
        target.style.transform = `translate(${this._position.x}px, ${this._position.y}px)`;
      },
    })
  }

  private configureResazible() {
    interact(this.element).resizable({
      modifiers: [
        interact.modifiers.aspectRatio({
          ratio: 'preserve',
          modifiers: [
            interact.modifiers.restrictSize({ max: 'parent' }),
          ],
        }),

      ],
      edges: { top: true, left: true, bottom: true, right: true },
      listeners: {
        move: (event) => {
          const target = event.target as HTMLElement;
          console.log(event)
          //this._position.x += event.deltaRect.left;
          //this._position.y += event.deltaRect.top;
          target.style.width = `${event.rect.width}px`;
          target.style.height = `${event.rect.height}px`;
          //target.style.transform = `translate(${this._position.x}px, ${this._position.y}px)`;
        }
      }
    })
  }

  createCorner(cornerPosition: CornerPosition): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add('corner');
    div.style.position = 'absolute';
    div.style.width = '10px';
    div.style.height = '10px';

    if (cornerPosition.x === 'left') {
      div.style.left = '0';
      div.style.borderLeft = 'solid 3px';
    }
    else {
      div.style.right = '0';
      div.style.borderRight = 'solid 3px';
    }

    if (cornerPosition.y === 'top') {
      div.style.top = '0';
      div.style.borderTop = 'solid 3px';
    }
    else {
      div.style.bottom = '0';
      div.style.borderBottom = 'solid 3px';
    }

    return div;
  }

  createCloseButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.id = 'delete-interactive-element';
    const style = btn.style;
    btn.innerText = 'x';
    style.position = 'absolute';
    style.right = '0';
    style.top = '-25px';
    style.fontSize = '1rem';
    style.fontWeight = '700';
    style.color = 'red';

    btn.addEventListener('click', () => {
      this.element.remove();
      this.callback.afterDelete();
    });

    return btn;
  }
}