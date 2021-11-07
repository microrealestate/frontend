import {
  Box,
  Card,
  CardActionArea,
  Divider,
  Paper,
  Typography,
  Toolbar as UIToolbar,
} from '@material-ui/core';
import { Children, memo, useMemo } from 'react';

import IconTypography from './IconTypography';

const _variantToBgColor = (variant) => {
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

export const CardRow = memo(function CardRow({ children, ...props }) {
  return (
    <Box display="flex" alignItems="center" {...props}>
      {Children.toArray(children).map((child, index) => (
        <Box key={index} flexGrow={index === 0 ? 1 : 0}>
          {child}
        </Box>
      ))}
    </Box>
  );
});

export const PageCard = memo(function PageCard({
  variant,
  Icon,
  title,
  info,
  children,
}) {
  const bgColor = useMemo(() => _variantToBgColor(variant), [variant]);
  return (
    <Paper>
      <Box
        p={1}
        bgcolor={bgColor}
        color="primary.contrastText"
        style={{
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        <Typography>{title}</Typography>
        <Box
          position="relative"
          height={130}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            position="absolute"
            left={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize={40}
          >
            <Icon fontSize="inherit" />
          </Box>
          {children}
        </Box>
        {!!info && <Typography>{info}</Typography>}
      </Box>
    </Paper>
  );
});

export const DashboardCard = memo(function DashboardCard({
  variant,
  Icon,
  title,
  info,
  Toolbar,
  children,
  onClick,
}) {
  const CardContent = () => (
    <Box mt={1.8}>
      {!!Toolbar && (
        <>
          <UIToolbar>
            <Box width="100%" display="flex" justifyContent="flex-end">
              {Toolbar}
            </Box>
          </UIToolbar>
          <Box pb={1}>
            <Divider variant="middle" />
          </Box>
        </>
      )}

      <Box px={1.8} pb={1.8} pt={Toolbar ? 0 : 1.8}>
        {children}
      </Box>

      {info && (
        <>
          <Divider />
          <Box p={1}>
            <Typography component="div" color="textSecondary" variant="caption">
              {info}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box position="relative">
      {onClick ? (
        <Card onClick={onClick}>
          <CardActionArea>
            <CardContent />
          </CardActionArea>
        </Card>
      ) : (
        <Card>
          <CardContent />
        </Card>
      )}
      <Box
        display="flex"
        alignItems="center"
        position="absolute"
        top={-12}
        left={10}
        right={10}
        px={1}
        borderRadius={3}
        color="primary.contrastText"
        bgcolor={_variantToBgColor(variant)}
      >
        <IconTypography Icon={Icon} noWrap>
          {title}
        </IconTypography>
      </Box>
    </Box>
  );
});
