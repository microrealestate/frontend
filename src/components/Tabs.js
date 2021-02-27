import { Box, Divider } from '@material-ui/core'

export const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return value === index ? (
    <>
      <Divider />
      <Box p={5}>
        {children}
      </Box>
    </>
  ) : null;
};
