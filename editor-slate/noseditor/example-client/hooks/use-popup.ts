import { useEffect, useState } from 'react';

export const usePopup = (popupRef) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      const clickedComponent = e.target;
      if (!popupRef?.current?.contains(clickedComponent)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [popupRef]);

  return [showPopup, setShowPopup] as const;
};
