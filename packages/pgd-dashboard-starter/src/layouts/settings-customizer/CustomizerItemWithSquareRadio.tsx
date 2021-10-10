import * as React from 'react';

type ConfigItem = {
  id: string;
  desc: string;
  activeClassName?: string;
  handleConfig?: Function;
};

type CustomizerItemWithSquareRadioProps = {
  configTitle: string;
  radioName: string;
  items: ConfigItem[];
};

export function CustomizerItemWithSquareRadio(
  props: CustomizerItemWithSquareRadioProps,
) {
  const { configTitle, radioName, items } = props;

  return (
    <div className='mt-3 px-3 border-bottom'>
      <h5 className='font-medium m-0'>{configTitle}</h5>
      <div
        className='btn-group btn-group-toggle mt-2 mb-3'
        data-toggle='buttons'
      >
        {items.map((item) => {
          const { id, desc, activeClassName, handleConfig } = item;
          return (
            <label
              className={'btn btn-outline-secondary ' + activeClassName}
              key={id}
            >
              <input
                type='radio'
                name={radioName}
                id={id}
                onClick={handleConfig as any}
              />
              {desc}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default CustomizerItemWithSquareRadio;
