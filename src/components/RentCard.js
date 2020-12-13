import _ from 'lodash';
import moment from 'moment';
import { Children, useState } from 'react'
import { Box, Button, Card, CardActions, CardContent, Divider, Grid, IconButton, List, ListItemText, Step, StepConnector, StepContent, StepLabel, Stepper, Tooltip, Typography } from "@material-ui/core";
import { withTranslation } from "../utils/i18n";
import { numberFormat, NumberFormat } from "../utils/numberformat";
import { useStyles } from '../styles/components/RentCards.styles';
import DoneIcon from '@material-ui/icons/Done';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { useObserver } from 'mobx-react-lite';
import IconTypography from './IconTypography';
import DownloadLink from './DownloadLink';

const CardRow = ({ children }) => (
    <Box display="flex">
        { Children.toArray(children).map((child, index) => (
            <Box key={index} flexGrow={index === 0 ? 1 : 0}>
                {child}
            </Box>
        ))}
    </Box>
);

const PaymentList = withTranslation()(({ t, rent: { payments } }) => {
    const filteredPayments = payments
        .filter(({ amount }) => amount > 0)
    return filteredPayments.length ? (
        <List
            aria-label="rent payments"
        >
            {filteredPayments.map(({ date, amount, type }, index) => (
                <ListItemText
                    key={index}
                    primary={
                        <Typography color="textSecondary" component="div" variant="caption">
                            {t('Paid {{amount}} by {{type}} on {{date}}', {
                                amount: numberFormat(amount),
                                type,
                                date: moment(date, 'DD/MM/YYYY').format('LL')
                            })}
                        </Typography>
                    }
                />
            ))
            }
        </List>
    ) : (
            <Typography color="textSecondary" component="div" variant="caption">
                {t('No payments have been recorded.')}
            </Typography>
        );
});

// const Contacts = ({ rent }) => {
//     const contacts = rent.occupant.contacts
//         .reduce((acc, { contact, email, phone }) => {
//             if (contact) {
//                 acc.names.push(_.startCase(_.capitalize(contact)));
//             }
//             if (email) {
//                 acc.emails.push(email.toLowerCase());
//             }
//             if (phone) {
//                 acc.phones.push(phone);
//             }

//             return acc;
//         }, { names: [], emails: [], phones: [] });

//     return (
//         <Typography
//             color="textSecondary"
//             variant="body2"
//         >
//             {contacts.names.length ? contacts.names[0] : <br />}
//         </Typography>
//         //  <CardContent className={classes.contact}>
//         //     <IconTypography
//         //         Icon={
//         //             <PersonIcon />
//         //         }
//         //     >
//         //         {contacts.names.join(' - ')}
//         //     </IconTypography>
//         //     <IconTypography
//         //         Icon={
//         //             <PhoneIcon />
//         //         }
//         //     >
//         //         {contacts.phones.join(' - ')}
//         //     </IconTypography>
//         //     <IconTypography
//         //         Icon={
//         //             <EmailIcon />
//         //         }
//         //     >
//         //         {contacts.emails.join(' - ')}
//         //     </IconTypography>
//         // </CardContent>
//     );
// }

const Header = ({ rent }) => {
    const classes = useStyles();

    return (
        <>
            <CardRow>
                <Tooltip
                    title={rent.occupant.name}
                    disableHoverListener={rent.occupant.name.length < 23}
                    arrow
                >
                    <Typography
                        className={classes.title}
                        noWrap
                    >
                        {rent.occupant.name}
                    </Typography>
                </Tooltip>
                <NumberFormat className={classes.amount} value={rent.totalToPay > 0 ? rent.totalToPay : 0} />
            </CardRow>
            <Typography
                variant="body2"
                color="textSecondary"
                className={classes.subTitle}
            >
                {rent.occupant.isCompany ? _.startCase(_.capitalize(rent.occupant.manager)) : <br />}
            </Typography>
        </>
    )
}

export const PaymentBalance = withTranslation()(({ t, rent }) => {
    const classes = useStyles();

    return (
        <>
            <CardRow>
                <Typography
                    color="textSecondary"
                    noWrap
                >
                    {t('Discount')}
                </Typography>
                <NumberFormat
                    color="textSecondary"
                    value={rent.promo}
                    noWrap
                />
            </CardRow>
            <CardRow>
                <Typography
                    color="textSecondary"
                    noWrap
                >
                    {t('Payments')}
                </Typography>
                <NumberFormat
                    color="textSecondary"
                    value={rent.payment}
                    noWrap
                />
            </CardRow>
            <CardRow>
                <Typography
                    color="textSecondary"
                    noWrap
                >
                    {rent.newBalance < 0 ? t('Debit balance') : rent.newBalance === 0 ? t('Balance') : t('Credit balance')}
                </Typography>
                <NumberFormat
                    className={rent.newBalance < 0 ? classes.debit : rent.newBalance > 0 ? classes.credit : ''}
                    color="textSecondary"
                    value={Math.abs(rent.newBalance)}
                    noWrap
                />
            </CardRow>
        </>
    )
});

const ExpandableStep = ({ children, title = '', onChange = () => { }, notExpandable = false, ...props }) => {
    const classes = useStyles();
    return (
        <>
            <StepLabel {...props} icon={' '}>
                {title}
                <IconButton
                    size="small"
                    onClick={onChange}
                    className={notExpandable || !props.completed ? classes.stepButtonHidden : ''}
                >
                    {props.expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
            </StepLabel>
            <StepContent {...props} className={classes.stepContent}>
                {props.expanded ? Children.toArray(children) : null}
            </StepContent>
        </>
    );
}

// const StepDownloadLink = ({ label, onClick = () => { } }) => {
//     return (
//         <Grid container wrap="nowrap" alignItems="center">
//             <Grid item>
//                 <Typography color="textSecondary" variant="caption">{label}</Typography>
//             </Grid>
//             <Grid item>
//                 <IconButton
//                     onClick={onClick}
//                     aria-label="download">
//                     <VerticalAlignBottomIcon fontSize="small" />
//                 </IconButton>
//             </Grid>
//         </Grid>
//     )
// }

const Steps = withTranslation()(({ t, rent }) => {
    const classes = useStyles();
    const [stepExpanded, setStepExpanded] = useState([false, false, false])

    const firstNoticeSent = rent.emailStatus && rent.emailStatus.status.rentcall;
    const secondNoticeSent = rent.emailStatus && rent.emailStatus.status.rentcall_reminder;
    const evictionNoticeSent = rent.emailStatus && rent.emailStatus.status.rentcall_last_reminder;
    const atLeastOneNoticeSent = firstNoticeSent || secondNoticeSent || evictionNoticeSent;
    const receiptSent = rent.emailStatus && rent.emailStatus.status.invoice;
    const rentPaid = rent.newBalance >= 0 || rent.status === 'paid';

    let firstNoticeSentText;
    if (firstNoticeSent) {
        const sentMoment = moment(rent.emailStatus.last.rentcall.sentDate);
        firstNoticeSentText = t('1st notice sent on {{date}}', { date: sentMoment.format('lll') });
    }

    let secondNoticeSentText;
    if (secondNoticeSent) {
        const sentMoment = moment(rent.emailStatus.last.rentcall_reminder.sentDate);
        secondNoticeSentText = t('2nd notice sent on {{date}}', { date: sentMoment.format('lll') });
    }

    let evictionNoticeSentText;
    if (evictionNoticeSent) {
        const sentMoment = moment(rent.emailStatus.last.rentcall_last_reminder.sentDate);
        evictionNoticeSentText = t('Eviction notice sent on {{date}}', { date: sentMoment.format('lll') });
    }

    let receiptSentText;
    if (receiptSent) {
        const sentMoment = moment(rent.emailStatus.last.invoice.sentDate);
        receiptSentText = t('Receipt sent on {{date}}', { date: sentMoment.format('lll') });
    }

    const onStepExpand = index => {
        const newStepExpanded = [...stepExpanded];
        newStepExpanded[index] = !stepExpanded[index];
        setStepExpanded(newStepExpanded);
    }

    return (
        <Stepper
            activeStep={-1}
            nonLinear={true}
            orientation="vertical"
            connector={<StepConnector classes={{ vertical: classes.stepConnector }} />}
        >
            <Step expanded={stepExpanded[0]} completed={atLeastOneNoticeSent}>
                <ExpandableStep
                    title={t('Notice sent')}
                    expanded={stepExpanded[0]}
                    onChange={() => onStepExpand(0)}
                >
                    {firstNoticeSent && (
                        <DownloadLink
                            label={firstNoticeSentText}
                            url={`/rentcall/${rent.occupant._id}/${rent.term}`}
                            documentName={`${rent.occupant.name}-${t('first notice')}.pdf`}
                            color="textSecondary" variant="caption"
                            withIcon
                        />
                    )}
                    {secondNoticeSent && (
                        <DownloadLink
                            label={secondNoticeSentText}
                            url={`/rentcall_reminder/${rent.occupant._id}/${rent.term}`}
                            documentName={`${rent.occupant.name}-${t('second notice')}.pdf`}
                            color="textSecondary" variant="caption"
                            withIcon
                        />
                    )}
                    {evictionNoticeSent && (
                        <DownloadLink
                            label={evictionNoticeSentText}
                            url={`/rentcall_last_reminder/${rent.occupant._id}/${rent.term}`}
                            documentName={`${rent.occupant.name}-${t('eviction')}.pdf`}
                            color="textSecondary" variant="caption"
                            withIcon
                        />
                    )}
                </ExpandableStep>
            </Step>
            <Step expanded={stepExpanded[1]} completed={rentPaid}>
                <ExpandableStep
                    title={t('Rent paid')}
                    expanded={stepExpanded[1]}
                    onChange={() => onStepExpand(1)}
                >
                    <PaymentList rent={rent} />
                </ExpandableStep>
            </Step>
            <Step expanded={stepExpanded[2]} completed={receiptSent}>
                <ExpandableStep
                    title={t('Receipt sent')}
                    expanded={stepExpanded[2]}
                    onChange={() => onStepExpand(2)}
                >
                    {receiptSent && (
                        <DownloadLink
                            label={receiptSentText}
                            url={`/invoice/${rent.occupant._id}/${rent.term}`}
                            documentName={`${rent.occupant.name}-${t('invoice')}.pdf`}
                            color="textSecondary" variant="caption"
                            withIcon
                        />
                    )}
                </ExpandableStep>
            </Step>
        </Stepper>
    )
});

const StatusAction = withTranslation()(({ t, rent, onEdit = () => { } }) => {
    const classes = useStyles();

    const rentPaid = rent.newBalance >= 0 || rent.status === 'paid';

    return useObserver(() => (
        <CardRow>
            { rentPaid ? (
                <IconTypography Icon={DoneIcon} component="div" noWrap className={`${classes.status} ${classes.credit}`}>{t('Paid')}</IconTypography>
            ) : (
            <br />
            )}
            <Button size="small" color="primary"
                onClick={() => onEdit(rent)}
            >
                {t('Edit')}
            </Button>
        </CardRow>
    ));
});

const RentCard = ({ rent, onEdit }) => {
    const classes = useStyles();

    return useObserver(() => (
        <Card>
            <CardContent className={classes.header}>
                <Header rent={rent} />
            </CardContent>
            <Divider variant="middle" />
            <CardContent>
                <PaymentBalance rent={rent} />
            </CardContent>
            <Divider variant="middle" />
            <Steps rent={rent} />
            <Divider variant="middle" />
            <CardActions>
                <StatusAction rent={rent} onEdit={onEdit} />
            </CardActions>
        </Card>
    ));
};

export default RentCard;