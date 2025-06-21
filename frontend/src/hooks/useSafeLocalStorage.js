import { useState } from 'react';

const useSafeLocalStorage = (key, defaultValue = null) => {
  const getStoredValue = () => {
    try {
      const saved = localStorage.getItem(key);
      return saved && saved !== 'undefined' ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse localStorage key "${key}"`, error);
      return defaultValue;
    }
  };

  const [value, setValue] = useState(getStoredValue);

  const updateValue = (newValue) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Failed to store localStorage key "${key}"`, error);
    }
  };

  const removeValue = () => {
    setValue(defaultValue);
    localStorage.removeItem(key);
  };

  return [value, updateValue, removeValue];
};

export default useSafeLocalStorage;