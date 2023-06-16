import './styles.css';

import cx from 'classnames';
import React, { type PropsWithChildren, type Ref, forwardRef } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({ children }) => {
  return typeof document === 'object'
    ? createPortal(children, document.body)
    : null;
};

interface BaseProps {
  className: string;
  [key: string]: unknown;
}

type OrNull<T> = T | null;

export const Button = forwardRef(
  (
    {
      className,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
        active: boolean;
        reversed: boolean;
      } & BaseProps
    >,
    ref: Ref<OrNull<HTMLSpanElement>>,
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(className)}
      style={{
        cursor: 'pointer',
        color: reversed
          ? active
            ? 'white'
            : '#aaa'
          : active
          ? 'black'
          : '#ccc',
      }}
    />
  ),
);

export const Icon = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLSpanElement>>,
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx('material-icons', className)}
      style={{
        fontSize: '18px',
        verticalAlign: 'text-bottom',
      }}
    />
  ),
);

export const Menu = React.forwardRef(
  (
    { className, style, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLDivElement>>,
  ) => (
    <div
      {...props}
      ref={ref}
      style={style}
      className={cx('slate-eg-menu', className)}
    />
  ),
);

export const Toolbar = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLDivElement>>,
  ) => (
    <Menu {...props} ref={ref} className={cx(className, `slate-rte-toolbar`)} />
  ),
);

// export const Instruction = React.forwardRef(
//   (
//     { className, ...props }: PropsWithChildren<BaseProps>,
//     ref: Ref<OrNull<HTMLDivElement>>,
//   ) => (
//     <div
//       {...props}
//       ref={ref}
//       className={cx(
//         className,
//         css`
//           white-space: pre-wrap;
//           margin: 0 -20px 10px;
//           padding: 10px 20px;
//           font-size: 14px;
//           background: #f8f8e8;
//         `,
//       )}
//     />
//   ),
// );

// export const EditorValue = React.forwardRef(
//   (
//     {
//       className,
//       value,
//       ...props
//     }: PropsWithChildren<
//       {
//         value: any;
//       } & BaseProps
//     >,
//     ref: Ref<OrNull<null>>,
//   ) => {
//     const textLines = value.document.nodes
//       .map((node) => node.text)
//       .toArray()
//       .join('\n');
//     return (
//       <div
//         ref={ref}
//         {...props}
//         className={cx(
//           className,
//           css`
//             margin: 30px -20px 0;
//           `,
//         )}
//       >
//         <div
//           className={css`
//             font-size: 14px;
//             padding: 5px 20px;
//             color: #404040;
//             border-top: 2px solid #eeeeee;
//             background: #f8f8f8;
//           `}
//         >
//           Slate's value as text
//         </div>
//         <div
//           className={css`
//             color: #404040;
//             font: 12px monospace;
//             white-space: pre-wrap;
//             padding: 10px 20px;
//             div {
//               margin: 0 0 0.5em;
//             }
//           `}
//         >
//           {textLines}
//         </div>
//       </div>
//     );
//   },
// );
