import * as React from 'react';

type ColorConfig = {
  bgColor: string;
  activeClassName?: string;
  handleConfig: Function;
};

type CustomizerItemForColorsProps = {
  configTitle: string;
  items: ColorConfig[];
};

export function CustomizerItemWithColorCircle(
  props: CustomizerItemForColorsProps,
) {
  const { configTitle, items } = props;

  return (
    <div className='mt-3 px-3 border-bottom'>
      <h5 className='font-medium m-0'>{configTitle}</h5>

      <ul className='theme-color mt-2 mb-3'>
        {items.map((config, index) => {
          const { bgColor, handleConfig, activeClassName } = config;
          return (
            <li className='theme-item' key={index}>
              <span
                className={`theme-link ${activeClassName}`}
                data-logobg={bgColor}
                onClick={handleConfig as any}
              >
                {' '}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CustomizerItemWithColorCircle;
