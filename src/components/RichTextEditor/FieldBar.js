import { Children, useCallback, useMemo, useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core';
import SearchBar from '../SearchBar';
import useTranslation from 'next-translate/useTranslation';

const StyledDrawer = withStyles((theme) => ({
  paper: {
    width: 350,
    backgroundColor: theme.palette.background.default,
  },
}))(Drawer);

export default function FieldBar({ fields, onInsertField }) {
  const { t } = useTranslation('common');
  const translatedFields = useMemo(() => {
    return fields.map((field) => ({
      ...field,
      title: t(field._id),
      description: t(`${field._id}_description`),
    }));
  }, [fields]);
  const [filteredFields, setFilteredFields] = useState(translatedFields);

  const onSearch = useCallback(
    (text) => {
      setFilteredFields(
        translatedFields.filter(({ title, description }) => {
          if (!text) {
            return true;
          }

          if (title.toLowerCase().indexOf(text.toLowerCase()) !== -1) {
            return true;
          }

          if (
            description &&
            description.toLowerCase().indexOf(text.toLowerCase()) !== -1
          ) {
            return true;
          }
          return false;
        })
      );
    },
    [fields]
  );

  return (
    <StyledDrawer variant="permanent" anchor="right" open>
      <Box mt={12}>
        <Toolbar>
          <SearchBar onSearch={onSearch} />
        </Toolbar>
        <List>
          {Children.toArray(
            filteredFields.map((field) => {
              return (
                <ListItem button onClick={() => onInsertField(field)}>
                  <ListItemText
                    primary={
                      <Box
                        p={0.2}
                        bgcolor="#e0e0e0"
                        component="span"
                        whiteSpace="nowrap"
                      >
                        {field.title}
                      </Box>
                    }
                    secondary={
                      <Box pt={1}>
                        <Typography variant="caption" noWrap={false}>
                          {field.description}
                        </Typography>
                      </Box>
                    }
                    disableTypography
                  />
                </ListItem>
              );
            })
          )}
        </List>
      </Box>
    </StyledDrawer>
  );
}
