import _ from 'lodash';
import moment from 'moment';
import { Children } from 'react'
import { useObserver } from 'mobx-react-lite';
import { Box, Button, Card, CardActions, CardContent, Chip, Divider, Step, StepConnector, StepLabel, Stepper, Tooltip, Typography, withStyles } from "@material-ui/core";
import DoneIcon from '@material-ui/icons/Done';
import { withTranslation } from "../utils/i18n";
import { NumberFormat } from "../utils/numberformat";
import DownloadLink from './DownloadLink';

import { useStyles } from '../styles/components/RentCards.styles';
import SendRentEmailMenu from './SendRentEmailMenu';

const SuccessChip = withStyles((theme) => ({
  root: {
    fontWeight: 'bold',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.success.main
  },
  icon: {
    color: theme.palette.common.white
  }
}))(Chip);

const CardRow = ({ children, ...props }) => (
  <Box display="flex" alignItems="center" {...props}>
    { Children.toArray(children).map((child, index) => (
      <Box key={index} flexGrow={index === 0 ? 1 : 0}>
        {child}
      </Box>
    ))}
  </Box>
);

const Header = withTranslation()(({ t, rent, onEdit }) => {
  const classes = useStyles();
  return (
    <>
      <Tooltip
        title={rent.occupant.name}
        disableHoverListener={rent.occupant.name.length < 23}
      >
        <Box fontSize={18}>
          <Typography
            variant="inherit"
            noWrap
          >
            {rent.occupant.name}
          </Typography>
        </Box>
      </Tooltip>
      <Box pb={1}>
        <Typography
          variant="body2"
          color="textSecondary"
          className={classes.subTitle}
        >
          {rent.occupant.isCompany ? _.startCase(_.capitalize(rent.occupant.manager)) : <br />}
        </Typography>
      </Box>
    </>
  )
});

const _rentDetails = rent => {
  const turnToNegative = amount => amount !== 0 ? amount * (-1) : 0;

  return {
    balance: turnToNegative(rent.balance),
    newBalance: rent.newBalance,
    additionalCosts: turnToNegative(rent.extracharge),
    rent: turnToNegative(rent.totalWithoutBalanceAmount + rent.promo - rent.extracharge),
    discount: rent.promo,
    payment: rent.payment,
    totalAmount: rent.totalAmount
  };
};

export const PaymentBalance = withTranslation()(({ t, rent }) => {
  const classes = useStyles();

  const balanceClass = (amount) => {
    return amount < 0 ? classes.debit : classes.credit;
  }
  const rentDetails = _rentDetails(rent);

  return (
    <>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Prev. balance')}
        </Typography>
        <NumberFormat
          className={balanceClass(rentDetails.balance)}
          color="textSecondary"
          value={rentDetails.balance}
          noWrap
        />
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Rent')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.rent}
          noWrap
        />
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Additional costs')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.additionalCosts}
          noWrap
        />
      </CardRow>
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Discount')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.discount}
          noWrap
        />
      </CardRow>
      <Divider />
      <CardRow>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Total to pay')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.totalAmount}
          noWrap
        />
      </CardRow>
      <CardRow pb={1.5}>
        <Typography
          color="textSecondary"
          noWrap
        >
          {t('Payments')}
        </Typography>
        <NumberFormat
          color="textSecondary"
          value={rentDetails.payment}
          noWrap
          withColor
        />
      </CardRow>
      <Divider />
      <CardRow pt={1.5}>
        <Typography
          color="textSecondary"
          noWrap
        >
          {rentDetails.newBalance < 0 ? t('Debit balance') : t('Credit balance')}
        </Typography>
        <NumberFormat
          className={balanceClass(rentDetails.newBalance)}
          color="textSecondary"
          value={rentDetails.newBalance}
          noWrap
        />
      </CardRow>
    </>
  )
});

// const RentStatus = withTranslation()(({ t, rent }) => {
//   const theme = useTheme();
//   const { organization: { selected: { locale, currency } } } = useContext(StoreContext);
//   const rentDetails = _rentDetails(rent);
//   let data = [
//     rentDetails.newBalance < 0 ? Math.abs(rentDetails.newBalance) : 0,
//     rentDetails.payment
//   ];

//   if (rentDetails.totalAmount <= 0) {
//     data = [
//       0,
//       Math.abs(rentDetails.rent)
//     ]
//   }

//   const labelFunc = (tooltipItem, data) => {
//     const amount = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
//     return [
//       t('Remaining {{amount}}', {
//         amount: numberFormat(locale, currency, amount)
//       }),
//       t('Paid {{amount}}', {
//         amount: numberFormat(locale, currency, amount)
//       })
//     ][tooltipItem.index];
//   }

//   return (
//     <>
//       <CardRow pb={1.5}>
//         <Typography
//           color="textSecondary"
//           noWrap
//         >
//           {t('Remaining payment')}
//         </Typography>
//         <Box py={0.4} fontSize={18}>
//           <NumberFormat
//             variant="inherit"
//             value={rentDetails.newBalance < 0 ? Math.abs(rentDetails.newBalance) : 0}
//           />
//         </Box>
//       </CardRow>
//       <Doughnut data={{
//         datasets: [{
//           data,
//           backgroundColor: [
//             hexToRgb(theme.palette.warning.main),
//             hexToRgb(theme.palette.success.main),
//           ]
//         }]
//       }}
//         options={{
//           animation: {
//             duration: 0 // general animation time
//           },
//           legend: {
//             display: false
//           },
//           tooltips: {
//             callbacks: {
//               label: labelFunc
//             }
//           }
//         }}
//       />
//     </>
//   );
// });

const Steps = withTranslation()(({ t, rent }) => {
  const classes = useStyles();

  const firstNoticeSent = rent.emailStatus && rent.emailStatus.status.rentcall;
  const secondNoticeSent = rent.emailStatus && rent.emailStatus.status.rentcall_reminder;
  const lastNoticeSent = rent.emailStatus && rent.emailStatus.status.rentcall_last_reminder;
  const atLeastOneNoticeSent = firstNoticeSent || secondNoticeSent || lastNoticeSent;
  const receiptSent = rent.emailStatus && rent.emailStatus.status.invoice;
  const rentPaid = rent.newBalance >= 0 || rent.status === 'paid';

  let firstNoticeSentText;
  if (firstNoticeSent) {
    const sentMoment = moment(rent.emailStatus.last.rentcall.sentDate);
    firstNoticeSentText = t('1st notice sent on {{date}}', { date: sentMoment.format('LLL') });
  }

  let secondNoticeSentText;
  if (secondNoticeSent) {
    const sentMoment = moment(rent.emailStatus.last.rentcall_reminder.sentDate);
    secondNoticeSentText = t('2nd notice sent on {{date}}', { date: sentMoment.format('LLL') });
  }

  let lastNoticeSentText;
  if (lastNoticeSent) {
    const sentMoment = moment(rent.emailStatus.last.rentcall_last_reminder.sentDate);
    lastNoticeSentText = t('Last notice sent on {{date}}', { date: sentMoment.format('LLL') });
  }

  let receiptSentText;
  if (receiptSent) {
    const sentMoment = moment(rent.emailStatus.last.invoice.sentDate);
    receiptSentText = t('Receipt sent on {{date}}', { date: sentMoment.format('LLL') });
  }

  const filteredPayments = rent.payments
    .filter(({ amount }) => amount > 0)
    .sort((p1, p2) => {
      const m1 = moment(p1.date, 'DD/MM/YYYY');
      const m2 = moment(p2.date, 'DD/MM/YYYY');

      if (m1.isSame(m2)) {
        return 0;
      }

      if (m1.isBefore(m2)) {
        return 1;
      }
      return -1;
    });

  const lastPayment = filteredPayments?.[0];

  return (
    <>
      { rentPaid ? (
        <Box py={1.85} align="right" color="success.main">
          <SuccessChip label={t('PAID')} icon={<DoneIcon />} />
        </Box>
      ) : (
          <CardRow py={2}>
            <Typography
              color="textSecondary"
              noWrap
            >
              {t('Remaining rent')}
            </Typography>
            <Box py={0.4} fontSize={16}>
              <NumberFormat
                variant="inherit"
                value={rent.newBalance < 0 ? Math.abs(rent.newBalance) : 0}
              />
            </Box>
          </CardRow>
        )}
      <Stepper
        activeStep={-1}
        nonLinear={true}
        orientation="vertical"
        connector={<StepConnector classes={{ vertical: classes.stepConnector }} />}
        style={{
          padding: 0
        }}
      >
        <Step>
          <StepLabel icon={' '} completed={atLeastOneNoticeSent}>
            {t('Notice sent')}
            {firstNoticeSent && (
              <DownloadLink
                tooltipText={firstNoticeSentText}
                url={`/rentcall/${rent.occupant._id}/${rent.term}`}
                documentName={`${rent.occupant.name}-${t('first notice')}.pdf`}
                color="textSecondary" variant="caption"
                withIcon
              />
            )}
            {secondNoticeSent && (
              <DownloadLink
                tooltipText={secondNoticeSentText}
                url={`/rentcall_reminder/${rent.occupant._id}/${rent.term}`}
                documentName={`${rent.occupant.name}-${t('second notice')}.pdf`}
                color="textSecondary" variant="caption"
                withIcon
              />
            )}
            {lastNoticeSent && (
              <DownloadLink
                tooltipText={lastNoticeSentText}
                url={`/rentcall_last_reminder/${rent.occupant._id}/${rent.term}`}
                documentName={`${rent.occupant.name}-${t('last notice')}.pdf`}
                color="textSecondary" variant="caption"
                withIcon
              />
            )}
          </StepLabel>
        </Step>
        <Step>
          <StepLabel icon={' '} completed={rentPaid}>
            {lastPayment ? t('Paid on {{date}}', { date: moment(lastPayment.date, 'DD/MM/YYYY').format('LL') }) : t('Paid')}
          </StepLabel>
        </Step>
        <Step>
          <StepLabel icon={' '} completed={receiptSent}>
            {t('Receipt sent')}
            {receiptSent && (
              <DownloadLink
                tooltipText={receiptSentText}
                url={`/invoice/${rent.occupant._id}/${rent.term}`}
                documentName={`${rent.occupant.name}-${t('invoice')}.pdf`}
                color="textSecondary" variant="caption"
                withIcon
              />
            )}
          </StepLabel>
        </Step>
      </Stepper>
    </>
  );
});

const RentCard = withTranslation()(({ t, rent, onEdit }) => {
  return useObserver(() => (
    <Card>
      <CardContent>
        <Header rent={rent} />
        <Divider />
        <Steps rent={rent} />
      </CardContent>
      <Divider variant="middle" />
      <CardActions>
        <CardRow width="100%">
          <SendRentEmailMenu
            period={moment(rent.term, 'YYYYMMDDHH')}
            tenantIds={[rent.occupant._id]}
            // onError={() => {}}
            size="small"
            color="primary"
          />
          <Button
            onClick={() => onEdit(rent)}
            size="small"
            color="primary"
          >
            {t('Edit')}
          </Button>
        </CardRow>
      </CardActions>
    </Card>
  ));
});

export default RentCard;