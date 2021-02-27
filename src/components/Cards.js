import { Children } from 'react';
import { Box, Divider, Paper, Typography } from '@material-ui/core';
import IconTypography from './IconTypography';

const _variantToBgColor = variant => {
  switch (variant) {
    case 'success':
      return 'success.main';
    case 'warning':
      return 'warning.main';
    case 'danger':
      return 'error.main';
    default:
      return 'info.main';
  }
};

export const CardRow = ({ children, ...props }) => (
  <Box display="flex" alignItems="center" {...props}>
    { Children.toArray(children).map((child, index) => (
      <Box key={index} flexGrow={index === 0 ? 1 : 0}>
        {child}
      </Box>
    ))}
  </Box>
);

export const PageCard = ({ variant, Icon, title, info, children}) => {

  return (
    <Paper>
      <Box
        p={1}
        bgcolor={_variantToBgColor(variant)}
        color="primary.contrastText"
        style={{
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4
        }}
      >
        <IconTypography Icon={Icon}>{title}</IconTypography>
        {children}
      </Box>
      <Divider />
      <Box p={1}>
        <Typography component="div" variant="caption">
          {info}
        </Typography>
      </Box>
    </Paper>
  );
};

export const DashboardCard = ({ variant, Icon, title, info, children }) => {

  return (
    <Paper style={{
      display: 'flex',
      marginTop: 16
    }}>
      <Box width="100%">
        <Box
          px={1}
          mt={-2}
          mx={2}
          borderRadius={3}
          color="primary.contrastText"
          bgcolor={_variantToBgColor(variant)}
        >
          <IconTypography Icon={Icon}>{title}</IconTypography>
        </Box>

        <Box p={2}>
          {children}
        </Box>
        {info && (
          <>
            <Divider />
            <Box p={1}>
              <Typography component="div" color="textSecondary" variant="caption">{info}</Typography>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  )
};