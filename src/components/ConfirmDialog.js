import { Box } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { memo, useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';

const ConfirmDialog = ({ children, open, setOpen, onConfirm }) => {
  const { t } = useTranslation('common');
  const handleClose = useCallback(() => setOpen(false), [setOpen]);
  const handleConfirm = useCallback(() => {
    setOpen(false);
    onConfirm(open);
  }, [setOpen, open]);

  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      aria-labelledby="confirm-dialog"
    >
      <Box p={1}>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          <Button size="small" variant="contained" onClick={handleClose}>
            {t('No')}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleConfirm}
            color="primary"
          >
            {t('Yes')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default memo(ConfirmDialog);
