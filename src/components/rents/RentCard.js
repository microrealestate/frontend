import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { memo, useCallback, useMemo } from 'react';

import BalanceBar from './BalanceBar';
import { CardRow } from '../Cards';
import DownloadLink from '../DownloadLink';
import { NumberFormat } from '../../utils/numberformat';
import SendRentEmailMenu from './SendRentEmailMenu';
import _ from 'lodash';
import moment from 'moment';
import { observer } from 'mobx-react-lite';
import { useStyles } from '../../styles/components/RentCards.styles';
import useTranslation from 'next-translate/useTranslation';

const Header = memo(function Header({ rent }) {
  const classes = useStyles();
  return (
    <>
      <Tooltip
        title={rent.occupant.name}
        disableHoverListener={rent.occupant.name.length < 23}
      >
        <Box fontSize={18}>
          <Typography variant="inherit" noWrap>
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
          {rent.occupant.isCompany ? (
            _.startCase(_.capitalize(rent.occupant.manager))
          ) : (
            <br />
          )}
        </Typography>
      </Box>
    </>
  );
});

const RentBar = memo(function RentBar({ rent }) {
  const { t } = useTranslation('common');
  const remainingRentToPay = useMemo(
    () => (rent.newBalance < 0 ? Math.abs(rent.newBalance) : 0),
    [rent.newBalance]
  );
  return (
    <>
      <BalanceBar rent={rent} />
      <CardRow pb={2}>
        <Typography variant="caption">{t('Left to pay')}</Typography>
        <NumberFormat variant="caption" value={remainingRentToPay} />
      </CardRow>
    </>
  );
});

const Steps = memo(({ rent }) => {
  const { t } = useTranslation('common');
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
    lastPayment,
  } = useMemo(() => {
    const firstNoticeSent =
      rent.emailStatus && rent.emailStatus.status.rentcall;
    const secondNoticeSent =
      rent.emailStatus && rent.emailStatus.status.rentcall_reminder;
    const lastNoticeSent =
      rent.emailStatus && rent.emailStatus.status.rentcall_last_reminder;
    const atLeastOneNoticeSent =
      firstNoticeSent || secondNoticeSent || lastNoticeSent;
    const receiptSent = rent.emailStatus && rent.emailStatus.status.invoice;
    const rentPaid = rent.newBalance >= 0 || rent.status === 'paid';

    let firstNoticeSentText;
    if (firstNoticeSent) {
      const sentMoment = moment(rent.emailStatus.last.rentcall.sentDate);
      firstNoticeSentText = t('1st notice sent on {{date}}', {
        date: sentMoment.format('LLL'),
      });
    }

    let secondNoticeSentText;
    if (secondNoticeSent) {
      const sentMoment = moment(
        rent.emailStatus.last.rentcall_reminder.sentDate
      );
      secondNoticeSentText = t('2nd notice sent on {{date}}', {
        date: sentMoment.format('LLL'),
      });
    }

    let lastNoticeSentText;
    if (lastNoticeSent) {
      const sentMoment = moment(
        rent.emailStatus.last.rentcall_last_reminder.sentDate
      );
      lastNoticeSentText = t('Last notice sent on {{date}}', {
        date: sentMoment.format('LLL'),
      });
    }

    let receiptSentText;
    if (receiptSent) {
      const sentMoment = moment(rent.emailStatus.last.invoice.sentDate);
      receiptSentText = t('Invoice sent on {{date}}', {
        date: sentMoment.format('LLL'),
      });
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
      lastPayment,
    };
  }, [rent.newBalance, rent.status, rent.emailStatus, rent.payments]);

  return (
    <Stepper
      activeStep={-1}
      nonLinear={true}
      orientation="vertical"
      connector={
        <StepConnector classes={{ vertical: classes.stepConnector }} />
      }
      style={{
        padding: 0,
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
              color="textSecondary"
              variant="caption"
              withIcon
            />
          )}
          {secondNoticeSent && (
            <DownloadLink
              tooltipText={secondNoticeSentText}
              url={`/rentcall_reminder/${rent.occupant._id}/${rent.term}`}
              documentName={`${rent.occupant.name}-${t('second notice')}.pdf`}
              color="textSecondary"
              variant="caption"
              withIcon
            />
          )}
          {lastNoticeSent && (
            <DownloadLink
              tooltipText={lastNoticeSentText}
              url={`/rentcall_last_reminder/${rent.occupant._id}/${rent.term}`}
              documentName={`${rent.occupant.name}-${t('last notice')}.pdf`}
              color="textSecondary"
              variant="caption"
              withIcon
            />
          )}
        </StepLabel>
      </Step>
      <Step>
        <StepLabel icon={' '} completed={rentPaid}>
          {lastPayment
            ? t('Paid on {{date}}', {
                date: moment(lastPayment.date, 'DD/MM/YYYY').format('LL'),
              })
            : t('Paid')}
        </StepLabel>
      </Step>
      <Step>
        <StepLabel icon={' '} completed={receiptSent}>
          {t('Invoice sent')}
          {receiptSent && (
            <DownloadLink
              tooltipText={receiptSentText}
              url={`/invoice/${rent.occupant._id}/${rent.term}`}
              documentName={`${rent.occupant.name}-${t('invoice')}.pdf`}
              color="textSecondary"
              variant="caption"
              withIcon
            />
          )}
        </StepLabel>
      </Step>
    </Stepper>
  );
});

const RentCard = observer(({ rent, onEdit }) => {
  const { t } = useTranslation('common');
  const _onEdit = useCallback(() => onEdit(rent), [rent, onEdit]);
  const period = useMemo(() => moment(rent.term, 'YYYYMMDDHH'), [rent.term]);

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
            tenant={rent.occupant}
            terms={[rent.term]}
            size="small"
            variant="contained"
            onError={() => {}}
          />
          <Button onClick={_onEdit} size="small" variant="contained">
            {t('Settlement')}
          </Button>
        </CardRow>
      </CardActions>
    </Card>
  );
});

export default memo(RentCard);
