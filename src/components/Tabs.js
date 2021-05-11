import { memo } from 'react';
import { Box, Divider } from '@material-ui/core';

export const TabPanel = memo(function TabPanel(props) {
  const { children, value, index } = props;

  return value === index ? (
    <>
      <Divider />
      <Box p={5}>{children}</Box>
    </>
  ) : null;
});
