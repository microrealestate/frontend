import _ from 'lodash';
import moment from 'moment';
import { memo, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Button, Card, CardActions, CardContent, Chip, Divider, Step, StepConnector, StepLabel, Stepper, Tooltip, Typography, withStyles } from "@material-ui/core";
import DoneIcon from '@material-ui/icons/Done';
import { withTranslation } from "../utils/i18n";
import { NumberFormat } from "../utils/numberformat";
import DownloadLink from './DownloadLink';
import SendRentEmailMenu from './SendRentEmailMenu';
import { CardRow } from './Cards';

import { useStyles } from '../styles/components/RentCards.styles';

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

const Header = ({ rent }) => {
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
};

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
//         amount: formatNumber(locale, currency, amount)
//       }),
//       t('Paid {{amount}}', {
//         amount: formatNumber(locale, currency, amount)
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

  const {
    firstNoticeSent,
    secondNoticeSent,
    lastNoticeSent,
    atLeastOneNoticeSent,
    receiptSent,
    rentPaid,
    firstNoticeSentText,
    secondNoticeSentText,
    lastNoticeSentText,
    receiptSentText,
    lastPayment
  } = useMemo(() => {
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

    return {
      firstNoticeSent,
      secondNoticeSent,
      lastNoticeSent,
      atLeastOneNoticeSent,
      receiptSent,
      rentPaid,
      firstNoticeSentText,
      secondNoticeSentText,
      lastNoticeSentText,
      receiptSentText,
      lastPayment
    };
  }, []);

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

const RentCard = withTranslation()(observer(({ t, rent, onEdit }) => {
  const _onEdit = useCallback(() => onEdit(rent), []);
  const period = useMemo(() => moment(rent.term, 'YYYYMMDDHH'), [rent.term]);
  const tenantIds = useMemo(() => [rent.occupant._id], [rent.occupant._id]);

  return (
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
            period={period}
            tenantIds={tenantIds}
            // onError={() => {}}
            size="small"
            color="primary"
          />
          <Button
            onClick={_onEdit}
            size="small"
            color="primary"
          >
            {t('Edit')}
          </Button>
        </CardRow>
      </CardActions>
    </Card>
  );
}));

export default memo(RentCard);