import React from 'react';

import {
  Button,
  DialogActions,
  DialogContent,
  Fade,
  Grid,
  Grow,
  Slide,
  Typography,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { type TransitionProps } from '@mui/material/transitions';

import { useAppDispatch, useAppSelector } from '../../shared/store';
import { patch } from '../app';
import { Spacer } from '../ui/Spacer';
import { Login } from './Login';
import { Register } from './Register';

// import { GoogleOneTapButton } from './GoogleOneTap';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export function OnboardingDialog() {
  const dispatch = useAppDispatch();
  const enableRegistration = useAppSelector(
    (state) => state.app.settings?.system?.enableRegistration,
  );
  const dialogMaybe = useAppSelector((state) => state.app.dialog);
  const [dialogType, setDialogType] = React.useState('login');
  const showDialog = dialogMaybe?.includes('onboard');
  const handleClose = React.useCallback(() => {
    dispatch(patch({ dialog: undefined }));
  }, [dispatch]);

  React.useEffect(() => {
    setDialogType(dialogMaybe?.split('.')[1] || 'login');
  }, [dialogMaybe, setDialogType]);

  if (!showDialog) {
    return null;
  }

  return (
    <Dialog
      open={showDialog}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <DialogContent>
        <Login sx={dialogType === 'login' ? null : { display: 'none' }} />
        <Grow in={dialogType === 'register'}>
          <div>
            <Register
              sx={dialogType === 'register' ? null : { display: 'none' }}
            />
          </div>
        </Grow>
        <Grid
          item
          xs={12}
          textAlign='center'
          sx={{ mb: 2 }}
          color='text.secondary'
        >
          <Typography>To save drawings you need an account</Typography>
          <Typography variant='body2'>
            *By using this site you agree to it&apos;s terms
          </Typography>
        </Grid>
        <DialogActions>
          {/* <GoogleOneTapButton style={{ marginBottom: '-5px' }} /> */}
          <Spacer />
          <Button variant='outlined' onClick={() => setDialogType('login')}>
            Sign in
          </Button>
          {enableRegistration && (
            <Button
              variant='outlined'
              onClick={() => setDialogType('register')}
            >
              Sign up
            </Button>
          )}
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingDialog;
