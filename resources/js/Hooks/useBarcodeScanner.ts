import { useEffect, useState } from 'react';

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'Enter' && barcode.length > 0) {
        onScan(barcode);
        setBarcode('');
      } else if (e.key.length === 1) { // Normal characters
        setBarcode(prev => prev + e.key);
      }

      // Reset barcode if it takes too long between keystrokes (scanner vs human typing)
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setBarcode('');
      }, 50);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [barcode, onScan]);
}
