import React, { useCallback } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { Box, Grid } from '@material-ui/core';
import { withTranslation } from 'next-i18next';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FullScreenDialogButton = withTranslation()(({ t, i18n, tReady, dialogTitle, buttonLabel, saveButtonLabel, cancelButtonLabel, showSave, showCancel, children, ...props }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSave = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <Button
        {...props}
        onClick={handleClickOpen}
        style={{ whiteSpace: 'nowrap' }}
      >
        {buttonLabel}
      </Button>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <Toolbar>
          <Box width="100%" display="flex" alignItems="center">
            <Box flexGrow={1}>
              <Typography variant="h6">
                {dialogTitle}
              </Typography>
            </Box>
            <Box>
              <Grid container spacing={1}>
                <Grid item>
                  {showCancel && (
                    <Button color="inherit" onClick={handleClose}>
                      {cancelButtonLabel || t('Cancel')}
                    </Button>
                  )}
                </Grid>
                <Grid item>
                  {showSave && (
                    <Button autoFocus color="primary" onClick={handleSave}>
                      {saveButtonLabel || t('Save')}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Toolbar>
        <Box py={2} px={3}>
          {children}
        </Box>
      </Dialog>
    </>
  );
});

export default FullScreenDialogButton;