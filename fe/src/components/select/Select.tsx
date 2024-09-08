import { ChangeEvent, useEffect, useState } from 'react';
import { SelectProps } from './types.ts';

export const Select = ({ items, onClick, label }: SelectProps) => {
  const [inputValue, setInputValue] = useState(
    items?.find((item) => item.deviceId === 'default').label
  );

  const handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const name = event.target.value;
    const item = items.find((item) => item.label === name);

    onClick(item);
    setInputValue(item.label);
  };

  useEffect(() => {
    const defaultDevice = items?.find((item) => item.deviceId === 'default');
    setInputValue(defaultDevice);
  }, []);

  return (
    <div className='selectContainer'>
      <span>{label}</span>
      <select className='select' onChange={handleOnChange} value={inputValue}>
        {items?.map((item) => (
          <option value={item.label} key={`${item.deviceId}_${item.groupId}`}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};
