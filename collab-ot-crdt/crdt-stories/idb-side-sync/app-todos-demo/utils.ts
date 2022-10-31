export const qs = document.querySelector.bind(document);
export const qsa = document.querySelectorAll.bind(document);

export function clear() {
  qs('#root').innerHTML = '';
}

export function append(str, root = qs('#root')) {
  const tpl = document.createElement('template');
  tpl.innerHTML = str;
  root.appendChild(tpl.content);
}

export function sanitize(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(reg, (match) => map[match]);
}

export function getColor(name) {
  switch (name) {
    case 'green':
      return 'bg-green-300';
    case 'blue':
      return 'bg-blue-300';
    case 'red':
      return 'bg-red-300';
    case 'orange':
      return 'bg-orange-300';
    case 'yellow':
      return 'bg-yellow-300';
    case 'teal':
      return 'bg-teal-300';
    case 'purple':
      return 'bg-purple-300';
    case 'pink':
      return 'bg-pink-300';
  }
  return 'bg-gray-100';
}

export const buttonClasses =
  'h-12 sm:h-10 px-8 rounded focus:ring-2 focus:ring-blue-600 text-white';
export const classes = {
  buttonPrimary: `${buttonClasses} bg-blue-600`,
  buttonSecondary: `${buttonClasses} bg-gray-400`,
  buttonDanger: `${buttonClasses} bg-red-500`,
  textInput: 'h-12 px-4 shadow-sm border border-gray-300 rounded',
  select: 'h-12 rounded shadow-sm border border-gray-300 text-gray-500',
  modalBackground:
    'absolute bottom-0 left-0 right-0 top-0 pt-16 flex justify-center items-start bg-gray-500 bg-opacity-40',
  modalContainer: 'flex-grow max-w-sm mx-4 p-4 bg-white rounded shadow-xl',
  modalTitle: 'text-lg font-bold mb-4 ext-lg font-bold mb-4',
};
