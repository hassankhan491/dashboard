import { useState, useEffect } from 'react';

export function useAgencyName() {
  const [name, setName] = useState(
    () => localStorage.getItem('agencyName') || 'Shariq Enterprises'
  );

  useEffect(() => {
    // Listen for the custom signal we will send from Settings
    const handleUpdate = () => {
      setName(localStorage.getItem('agencyName') || 'Shariq Enterprises');
    };
    
    window.addEventListener('agencyNameChanged', handleUpdate);
    return () => window.removeEventListener('agencyNameChanged', handleUpdate);
  }, []);

  return name;
}