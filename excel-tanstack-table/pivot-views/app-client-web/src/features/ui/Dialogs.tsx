import React from 'react';

import { routes } from '../../shared/routes';
import OnboardingDialog from '../profile/OnboardingDialog';

const dialogs = routes.filter(
  (route) => route.dialog && !route.dialog?.includes('onboard'),
);

/**
 * Multi component dialogs that return empty if not open
 * Dev Note: Single component level dialogs -> inside component
 * @returns
 */
export function Dialogs() {
  return (
    <>
      {dialogs.map((dialog) => {
        const DialogComponent = dialog.component;
        return <DialogComponent key={dialog.dialog} />;
      })}
      <OnboardingDialog />
    </>
  );
}

export default Dialogs;
