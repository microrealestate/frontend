import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import { Children, useCallback, useContext, useState } from 'react';

import AddIcon from '@material-ui/icons/Add';
import ConfirmDialog from '../ConfirmDialog';
import { DashboardCard } from '../Cards';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/DescriptionOutlined';
import { EmptyIllustration } from '../Illustrations';
import { observer } from 'mobx-react-lite';
import RichTextEditorDialog from '../RichTextEditor/RichTextEditorDialog';
import { StoreContext } from '../../store';
import useTranslation from 'next-translate/useTranslation';

const LeaseTemplatesCard = () => {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);
  const [editTemplate, setEditTemplate] = useState(false);
  const [templateToRemove, setTemplateToRemove] = useState(false);

  const onLoadTemplate = useCallback(async () => {
    if (!editTemplate || !editTemplate._id) {
      return '';
    }
    store.template.setSelected(
      store.template.items.find(({ _id }) => _id === editTemplate._id)
    );
    return store.template.selected.contents;
  }, [store.template.items, editTemplate]);

  const onSaveTemplate = useCallback(
    async (title, contents, html) => {
      //setError('');
      if (!editTemplate._id) {
        const { status, data } = await store.template.create({
          name: title,
          type: 'contract',
          contents,
          html,
          linkedResourceIds: store.lease.selected?._id
            ? [store.lease.selected._id]
            : [],
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
        editTemplate._id = data._id;
      } else {
        const { status } = await store.template.update({
          _id: editTemplate._id,
          name: title,
          type: 'contract',
          contents,
          html,
          linkedResourceIds: editTemplate.linkedResourceIds?.includes(
            store.lease.selected?._id
          )
            ? editTemplate.linkedResourceIds
            : [
                ...(editTemplate.linkedResourceIds || []),
                store.lease.selected._id,
              ],
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
    [editTemplate, store.lease.selected]
  );

  const onDeleteTemplate = useCallback(async () => {
    if (!templateToRemove) {
      return;
    }

    if (templateToRemove.linkedResourceIds?.length <= 1) {
      await store.template.delete([templateToRemove._id]);
    } else {
      await store.template.update({
        ...templateToRemove,
        linkedResourceIds: store.lease.selected?._id
          ? [
              ...editTemplate.linkedResourceIds.filter(
                (_id) => store.lease.selected._id !== _id
              ),
            ]
          : templateToRemove.linkedResourceIds,
      });
    }
  }, [templateToRemove, store.lease.selected]);

  // TODO: optimize to not recompute the template list on each rendered
  const templates = store.template.items.filter(({ linkedResourceIds = [] }) =>
    linkedResourceIds.includes(store.lease.selected?._id)
  );

  return (
    <DashboardCard
      Icon={DescriptionIcon}
      title={t('Document templates')}
      Toolbar={
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditTemplate({})}
        >
          {t('Add')}
        </Button>
      }
    >
      {templates.length > 0 ? (
        <List dense>
          {Children.toArray(
            templates.map((template) => (
              <ListItem button onClick={() => setEditTemplate(template)}>
                <ListItemText id={template._id} primary={template.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="comments"
                    onClick={() => setTemplateToRemove(template)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      ) : (
        <EmptyIllustration label={t('No document templates defined')} />
      )}
      <RichTextEditorDialog
        open={editTemplate}
        setOpen={setEditTemplate}
        onLoad={onLoadTemplate}
        onSave={onSaveTemplate}
        title={editTemplate.name}
        fields={store.template.fields}
      />
      <ConfirmDialog
        title={t('Are you sure to remove this template?')}
        subTitle={templateToRemove.name}
        open={templateToRemove}
        setOpen={setTemplateToRemove}
        onConfirm={onDeleteTemplate}
      />
    </DashboardCard>
  );
};

export default observer(LeaseTemplatesCard);
