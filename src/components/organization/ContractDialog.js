import jsesc from 'jsesc';
import dynamic from 'next/dynamic';
import { useCallback, useContext, useMemo } from 'react';
import { Dialog, withStyles } from '@material-ui/core';
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

const ContractDialog = ({ open, setOpen, onSubmit }) => {
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
      //     return setError(t('Template does not exist'));
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
          //     return setError(t('Template does not exist'));
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
          //     return setError(t('Template does not exist'));
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
        _id: 'current_place',
        marker: '{{current.place}}',
        type: 'string',
      },
      {
        _id: 'current_date',
        marker: '{{current.date}}',
        type: 'date',
      },
      {
        _id: 'landlord_name',
        marker: '{{landlord.name}}',
        type: 'string',
      },
      {
        _id: 'landlord_contact_phones',
        marker: '{{landlord.contact.phones}}',
        type: 'array',
      },
      {
        _id: 'landlord_contact_emails',
        marker: '{{landlord.contact.emails}}',
        type: 'array',
      },
      {
        _id: 'landlord_address',
        marker: '{{landlord.address}}',
        type: 'string',
      },
      {
        _id: 'landlord_companyInfo_legalRepresentative',
        marker: '{{landlord.companyInfo.legalRepresentative}}',
        type: 'string',
      },
      {
        _id: 'landlord_companyInfo_legalStructure',
        marker: '{{landlord.companyInfo.legalStructure}}',
        type: 'string',
      },
      {
        _id: 'landlord_companyInfo_capital',
        marker: '{{landlord.companyInfo.capital}}',
        type: 'amount',
      },
      {
        _id: 'landlord_companyInfo_ein',
        marker: '{{landlord.companyInfo.ein}}',
        type: 'string',
      },
      {
        _id: 'landlord_companyInfo_dos',
        marker: '{{landlord.companyInfo.dos}}',
        type: 'string',
      },
      {
        _id: 'tenant_name',
        marker: '{{tenant.name}}',
        type: 'string',
      },
      {
        _id: 'tenant_contact_phones',
        marker: '{{tenant.contact.phones}}',
        type: 'array',
      },
      {
        _id: 'tenant_contact_emails',
        marker: '{{tenant.contact.emails}}',
        type: 'array',
      },
      {
        _id: 'tenant_address',
        marker: '{{tenant.address}}',
        type: 'string',
      },
      {
        _id: 'tenant_companyInfo_legalRepresentative',
        marker: '{{tenant.companyInfo.legalRepresentative}}',
        type: 'string',
      },
      {
        _id: 'tenant_companyInfo_legalStructure',
        marker: '{{tenant.companyInfo.legalStructure}}',
        type: 'string',
      },
      {
        _id: 'tenant_companyInfo_capital',
        marker: '{{tenant.companyInfo.capital}}',
        type: 'amount',
      },
      {
        _id: 'tenant_companyInfo_ein',
        marker: '{{tenant.companyInfo.ein}}',
        type: 'string',
      },
      {
        _id: 'tenant_companyInfo_dos',
        marker: '{{tenant.companyInfo.dos}}',
        type: 'string',
      },
      {
        _id: 'property_address',
        marker: '{{property.address}}',
        type: 'string',
      },
      {
        _id: 'property_surface',
        marker: '{{property.surface}}',
        type: 'surface',
      },
      {
        _id: 'lease_beginDate',
        marker: '{{lease.beginDate}}',
        type: 'date',
      },
      {
        _id: 'lease_endDate',
        marker: '{{lease.endDate}}',
        type: 'date',
      },
      {
        _id: 'lease_rent',
        marker: '{{lease.rent}}',
        type: 'amount',
      },
      {
        _id: 'lease_expenses',
        marker: '{{lease.expenses}}',
        type: 'array',
      },
      {
        _id: 'lease_deposit',
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
    >
      <RichTextEditor
        title={open.name}
        fields={fields}
        onLoad={onLoad}
        onSave={onSave}
        onClose={handleClose}
        showPrintButton
        placeholder={
          '\nFunctionality is not fully implemented. Work in progress here.'
        }
      />
    </RichTextEditorDialog>
  );
};

export default ContractDialog;
