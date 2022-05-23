import { computePosition } from '@floating-ui/dom';

function generateGetBoundingClientRect(x = 0, y = 0) {
  return () => ({
    width: 0,
    height: 0,
    x,
    y,
    top: y,
    right: x,
    bottom: y,
    left: x,
  });
}

const tooltip = document.querySelector('#tooltip') as any;

const virtualElement = {
  getBoundingClientRect: generateGetBoundingClientRect(),
};

export const HelloVirtualElementMouseMove = () => {
  document.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
    virtualElement.getBoundingClientRect = generateGetBoundingClientRect(x, y);

    console.log(';; mousemove ', x, y);

    computePosition(virtualElement, tooltip).then(({ x, y }) => {
      // Position the floating element relative to the click
      Object.assign(tooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  });
};
