import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler); // Nettoyer l'ancien délai si la valeur change avant expiration
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
