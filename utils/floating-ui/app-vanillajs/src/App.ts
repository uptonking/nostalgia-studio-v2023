import './index.css';

import { computePosition } from '@floating-ui/dom';

// const change = (msg) => {
//   // document.querySelector('root').innerText = msg;
//   document.querySelector('#root').innerHTML = `
//   <h1>本页面支持热加载 floating-ui-vanilla-app-ts</h1>
//   ${msg}
//   <div>
//     <input type="text" />
//   </div>
//   `;
// };
// change('test 测试 sample-vanilla-ts');

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
