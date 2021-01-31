import { Box } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withTranslation } from '../utils/i18n';

const ConfirmDialog = withTranslation()(({ t, children, open, setOpen, onConfirm }) => {
  return (
    <Dialog
      open={!!open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <Box p={1}>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          <Button
            size="small"
            variant="contained"
            onClick={() => setOpen(false)}
          >
            {t('No')}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              setOpen(false);
              onConfirm(open);
            }}
            color="primary"
          >
            {t('Yes')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
});

export default ConfirmDialog;