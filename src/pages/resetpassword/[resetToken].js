import React, { useContext } from 'react';
import { useObserver } from 'mobx-react-lite';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { FormTextField, SubmitButton } from '../../components/Form';

import { useStyles } from '../../styles/pages/ResetPassword.styles';
import { withTranslation } from '../../utils/i18n';
import { StoreContext } from '../../store';
import { useRouter } from 'next/router';

const initialValues = {
    password: '',
    confirmationPassword: ''
};

const validationSchema = Yup.object().shape({
    password: Yup.string()
        .required('Required'),
    confirmationPassword: Yup.string()
        .required('Required')
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

const ResetPassword = withTranslation()(({ t }) => {
    const store = useContext(StoreContext);
    const classes = useStyles();
    const router = useRouter();

    const { resetToken } = router.query;

    const resetPassword = async ({ password }, actions) => {
        try {
            await user.resetPassword(resetToken, password);
            router.push('/signin');
        } catch (error) {
            console.error(error);
        }
    };

    const signIn = event => {
        event.preventDefault();
        router.push('/signin');
    };

    return useObserver(() => (
        <div className={classes.main}>
            <div className={classes.pageTitle}>
                <LocationCityIcon fontSize="large" />
                <Typography component="h1" variant="h5">
                    Reset your password
        </Typography>
            </div>
            <Paper className={classes.resetPasswordPaper}>
                <Collapse className={classes.alert} in={!!store.error}>
                    <Alert severity="error">{store.error}</Alert>
                </Collapse>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={resetPassword}
                >
                    {({ isValid }) => {
                        return (
                            <Form className={classes.form}>
                                <FormTextField
                                    label="New password"
                                    name="password"
                                    type="password"
                                />
                                <FormTextField
                                    label="Confirmation password"
                                    name="confirmationPassword"
                                    type="password"
                                />
                                <div className={classes.formActions}>
                                    <Button
                                        variant="contained"
                                        onClick={signIn}
                                    >
                                        Cancel
                                    </Button>
                                    <SubmitButton
                                        label={!isSubmitting ? t('Reset my password') : t('Reseting')}
                                    />
                                </div>
                            </Form>
                        )
                    }}
                </Formik>
            </Paper>
        </div>
    ));
});

export default ResetPassword;