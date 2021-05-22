import { Children, useCallback, useState } from 'react';
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
import { withTranslation } from 'next-i18next';

const StyledDrawer = withStyles((theme) => ({
  paper: {
    width: 350,
    backgroundColor: theme.palette.background.default,
  },
}))(Drawer);

export default withTranslation()(function FieldBar({
  t,
  fields,
  onInsertField,
}) {
  const [filteredFields, setFilteredFields] = useState(fields);

  const onSearch = useCallback(
    (text) => {
      setFilteredFields(
        fields.filter(({ _id }) => {
          if (!text) {
            return true;
          }

          const title = t(_id);
          const description = t(`${_id}.description`);

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
              const title = t(field._id);
              const description = t(`${field._id}.description`);

              return (
                <ListItem
                  button
                  onClick={() =>
                    onInsertField({ ...field, title, description })
                  }
                >
                  <ListItemText
                    primary={
                      <Box
                        p={0.2}
                        bgcolor="#e0e0e0"
                        component="span"
                        whiteSpace="nowrap"
                      >
                        {title}
                      </Box>
                    }
                    secondary={
                      <Box pt={1}>
                        <Typography variant="caption" noWrap={false}>
                          {description}
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
});
