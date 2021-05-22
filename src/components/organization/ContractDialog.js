import jsesc from 'jsesc';
import dynamic from 'next/dynamic';
import { useCallback, useContext, useMemo } from 'react';
import { Dialog, withStyles } from '@material-ui/core';
import { withTranslation } from 'next-i18next';
import { StoreContext } from '../../store';
import { grayColor } from '../../styles/styles';

const RichTextEditor = dynamic(import('../RichTextEditor/RichTextEditor'), {
  ssr: false,
});

const RichTextEditorDialog = withStyles(() => ({
  paperFullScreen: {
    backgroundColor: grayColor[10],
  },
}))(Dialog);

const ContractDialog = withTranslation()(({ open, setOpen, onSubmit }) => {
  const store = useContext(StoreContext);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onLoad = useCallback(async () => {
    const lease = open;
    if (!lease || !lease.templateId) {
      return '';
    }

    // TODO: handle errors
    //setError('');

    const { status, data } = await store.template.fetchOne(lease.templateId);
    if (status !== 200) {
      // switch (status) {
      //   case 422:
      //     return setError(
      //       t('')
      //     );
      //   case 404:
      //     return setError(t('Template does not exist.'));
      //   case 403:
      //     return setError(t(''));
      //   default:
      //     return setError(t('Something went wrong'));
      // }
      return console.error(status);
    }
    return data.contents;
  }, [open]);

  const onSave = useCallback(
    async (contents, html) => {
      const lease = open;

      //setError('');

      if (!lease.templateId) {
        const { status, data } = await store.template.create({
          name: lease.name,
          type: 'contract',
          contents,
          html: jsesc(html),
        });
        if (status !== 200) {
          // switch (status) {
          //   case 422:
          //     return setError(
          //       t('')
          //     );
          //   case 404:
          //     return setError(t('Template does not exist.'));
          //   case 403:
          //     return setError(t(''));
          //   default:
          //     return setError(t('Something went wrong'));
          // }
          return console.error(status);
        }
        await onSubmit({
          ...lease,
          templateId: data._id,
        });
      } else {
        const { status } = await store.template.update({
          _id: lease.templateId,
          name: lease.name,
          type: 'contract',
          contents,
          html: jsesc(html),
        });
        if (status !== 200) {
          // switch (status) {
          //   case 422:
          //     return setError(
          //       t('')
          //     );
          //   case 404:
          //     return setError(t('Template does not exist.'));
          //   case 403:
          //     return setError(t(''));
          //   default:
          //     return setError(t('Something went wrong'));
          // }
          return console.error(status);
        }
      }
    },
    [open]
  );

  // TODO: move that to the backend
  const fields = useMemo(
    () => [
      {
        _id: 'current.place',
        marker: '{{current.place}}',
        type: 'string',
      },
      {
        _id: 'current.date',
        marker: '{{current.date}}',
        type: 'date',
      },
      {
        _id: 'landlord.name',
        marker: '{{landlord.name}}',
        type: 'string',
      },
      {
        _id: 'landlord.contact.phones',
        marker: '{{landlord.contact.phones}}',
        type: 'array',
      },
      {
        _id: 'landlord.contact.emails',
        marker: '{{landlord.contact.emails}}',
        type: 'array',
      },
      {
        _id: 'landlord.address',
        marker: '{{landlord.address}}',
        type: 'string',
      },
      {
        _id: 'landlord.companyInfo.legalRepresentative',
        marker: '{{landlord.companyInfo.legalRepresentative}}',
        type: 'string',
      },
      {
        _id: 'landlord.companyInfo.legalStructure',
        marker: '{{landlord.companyInfo.legalStructure}}',
        type: 'string',
      },
      {
        _id: 'landlord.companyInfo.capital',
        marker: '{{landlord.companyInfo.capital}}',
        type: 'amount',
      },
      {
        _id: 'landlord.companyInfo.ein',
        marker: '{{landlord.companyInfo.ein}}',
        type: 'string',
      },
      {
        _id: 'landlord.companyInfo.dos',
        marker: '{{landlord.companyInfo.dos}}',
        type: 'string',
      },
      {
        _id: 'tenant.name',
        marker: '{{tenant.name}}',
        type: 'string',
      },
      {
        _id: 'tenant.contact.phones',
        marker: '{{tenant.contact.phones}}',
        type: 'array',
      },
      {
        _id: 'tenant.contact.emails',
        marker: '{{tenant.contact.emails}}',
        type: 'array',
      },
      {
        _id: 'tenant.address',
        marker: '{{tenant.address}}',
        type: 'string',
      },
      {
        _id: 'tenant.companyInfo.legalRepresentative',
        marker: '{{tenant.companyInfo.legalRepresentative}}',
        type: 'string',
      },
      {
        _id: 'tenant.companyInfo.legalStructure',
        marker: '{{tenant.companyInfo.legalStructure}}',
        type: 'string',
      },
      {
        _id: 'tenant.companyInfo.capital',
        marker: '{{tenant.companyInfo.capital}}',
        type: 'amount',
      },
      {
        _id: 'tenant.companyInfo.ein',
        marker: '{{tenant.companyInfo.ein}}',
        type: 'string',
      },
      {
        _id: 'tenant.companyInfo.dos',
        marker: '{{tenant.companyInfo.dos}}',
        type: 'string',
      },
      {
        _id: 'property.address',
        marker: '{{property.address}}',
        type: 'string',
      },
      {
        _id: 'property.surface',
        marker: '{{property.surface}}',
        type: 'surface',
      },
      {
        _id: 'lease.beginDate',
        marker: '{{lease.beginDate}}',
        type: 'date',
      },
      {
        _id: 'lease.endDate',
        marker: '{{lease.endDate}}',
        type: 'date',
      },
      {
        _id: 'lease.rent',
        marker: '{{lease.rent}}',
        type: 'amount',
      },
      {
        _id: 'lease.expenses',
        marker: '{{lease.expenses}}',
        type: 'array',
      },
      {
        _id: 'lease.deposit',
        marker: '{{lease.deposit}}',
        type: 'amount',
      },
    ],
    []
  );

  return (
    <RichTextEditorDialog
      fullScreen
      disableEscapeKeyDown
      open={!!open}
      aria-labelledby="form-dialog-title"
      placeholder={
        'Functionality is not fully implemented. Work in progress here.'
      }
    >
      <RichTextEditor
        title={open.name}
        fields={fields}
        onLoad={onLoad}
        onSave={onSave}
        onClose={handleClose}
        showPrintButton
      />
    </RichTextEditorDialog>
  );
});

export default ContractDialog;
