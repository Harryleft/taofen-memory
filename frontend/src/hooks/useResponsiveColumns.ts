import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024
};

interface UseResponsiveColumnsReturn {
  columns: number;
}

export const useResponsiveColumns = (): UseResponsiveColumnsReturn => {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.sm) setColumns(1);
      else if (width < BREAKPOINTS.md) setColumns(2);
      else if (width < BREAKPOINTS.lg) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return { columns };
};