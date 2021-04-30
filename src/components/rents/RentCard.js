import _ from 'lodash';
import moment from 'moment';
import { memo, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Box, Button, Card, CardActions, CardContent, Divider, Step, StepConnector, StepLabel, Stepper, Tooltip, Typography, useTheme } from "@material-ui/core";
import { withTranslation } from "../../utils/i18n";
import { NumberFormat } from "../../utils/numberformat";
import DownloadLink from '../DownloadLink';
import { CardRow } from '../Cards';
import SendRentEmailMenu from './SendRentEmailMenu';

import { useStyles } from '../../styles/components/RentCards.styles';
import RentPeriod from './RentPeriod';

const Header = memo(({ rent }) => {
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

const RentBar = memo(withTranslation()(({ t, rent }) => {
  const theme = useTheme();

  const data = useMemo(() => {
    const leftToPayInBalance = rent.balance - rent.payment;
    const leftToPayInCurrentRent = leftToPayInBalance < 0 ? rent.totalWithoutBalanceAmount + leftToPayInBalance : rent.totalWithoutBalanceAmount;
    return [
      {
        name: '',
        payment: rent.payment,
        balance: leftToPayInBalance > 0 ? leftToPayInBalance : 0,
        currentRent: leftToPayInCurrentRent > 0 ? leftToPayInCurrentRent : 0
      }
    ];
  }, [rent.payment, rent.totalWithoutBalanceAmount, rent.balance])

  const remainingRentToPay = useMemo(() => rent.newBalance < 0 ? Math.abs(rent.newBalance) : 0, [rent.newBalance]);

  return (
    <>
      <CardRow>
        <RentPeriod term={rent.term} frequency={rent.occupant.frequency} />
        <NumberFormat variant="h5" value={rent.totalToPay} />
      </CardRow>
      <Tooltip
        title={
          <Box width={200}>
            <CardRow>
              <Typography>{t('Balance')}</Typography>
              <NumberFormat value={rent.balance} />
            </CardRow>
            <CardRow pt={1}>
              <Typography>{t('Rent')}</Typography>
              <NumberFormat value={rent.totalWithoutBalanceAmount} />
            </CardRow>
            <CardRow py={1}>
              <Typography>{t('Total')}</Typography>
              <NumberFormat value={rent.totalToPay} />
            </CardRow>
            <CardRow>
              <Typography>{t('Payment')}</Typography>
              <NumberFormat value={rent.payment} />
            </CardRow>
          </Box>
        }
      >
        <span>
          <ResponsiveContainer height={50}>
            <BarChart layout="vertical" stackOffset="sign" data={data}>
              <XAxis type="number" hide={true} axisLine={false} domain={['dataMin', 'dataMax']} />
              <YAxis dataKey="name" hide={true} type="category" />
              <Bar isAnimationActive={false} dataKey="payment" stackId="a" fill={theme.palette.success.main} background={{ fill: theme.palette.grey[200] }} />
              <Bar isAnimationActive={false} dataKey="balance" stackId="a" fill={theme.palette.warning.dark} />
              <Bar isAnimationActive={false} dataKey="currentRent" stackId="a" fill={theme.palette.warning.main} />
            </BarChart>
          </ResponsiveContainer>
        </span>
      </Tooltip>
      <CardRow pb={2}>
        <Typography variant="caption">{t('Left to pay')}</Typography>
        <NumberFormat variant="caption" value={remainingRentToPay} />
      </CardRow>
    </>
  );
}));

const Steps = memo(withTranslation()(({ t, rent }) => {
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
  }, [rent.emailStatus, rent.payments]);

  return (
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
  );
}));

const RentCard = withTranslation()(observer(({ t, rent, onEdit }) => {
  const _onEdit = useCallback(() => onEdit(rent), [rent]);
  const period = useMemo(() => moment(rent.term, 'YYYYMMDDHH'), [rent.term]);
  const { tenantIds, terms } = useMemo(() => ({ tenantIds: [rent.occupant._id], terms: [rent.term] }), [rent.occupant._id]);

  return (
    <Card>
      <CardContent>
        <Header rent={rent} />
        <RentBar rent={rent} />
        <Divider />
        <Box pt={2}>
          <Steps rent={rent} />
        </Box>
      </CardContent>
      <Divider variant="middle" />
      <CardActions>
        <CardRow width="100%">
          <SendRentEmailMenu
            period={period}
            tenantIds={tenantIds}
            terms={terms}
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