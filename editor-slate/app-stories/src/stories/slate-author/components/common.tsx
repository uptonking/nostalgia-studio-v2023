import { createPortal } from 'react-dom';

export const Portal = ({ children }) => {
  return typeof document === 'object'
    ? createPortal(children, document.body)
    : null;
};
