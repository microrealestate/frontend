import React, { useContext } from 'react';
import { useObserver } from 'mobx-react-lite';
import getConfig from 'next/config'
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { FormTextField, SubmitButton } from '../components/Form';

import { useStyles } from '../styles/pages/SignUp.styles';
import { withTranslation } from '../utils/i18n';
import { StoreContext } from '../store';
import Link from '../components/Link';
import { useRouter } from 'next/router';

const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
};

const validationSchema = Yup.object().shape({
    firstName: Yup.string()
        .required('Required'),
    lastName: Yup.string()
        .required('Required'),
    email: Yup.string()
        .email('Invalid email')
        .required('Required'),
    password: Yup.string()
        .required('Required')
});

const SignUp = withTranslation()(({ t }) => {
    const { publicRuntimeConfig: { APP_NAME } } = getConfig();
    const store = useContext(StoreContext);
    const classes = useStyles();
    const router = useRouter();

    const signUp = async ({ firstName, lastName, email, password }, actions) => {
        try {
            await store.user.signUp(firstName, lastName, email, password);
            router.push('/signin');
        } catch (error) {
            console.error(error);
        }
    };

    return useObserver(() => (
        <div className={classes.main}>
            <div className={classes.pageTitle}>
                <LocationCityIcon fontSize="large" />
                <Typography component="h1" variant="h5">
                    {`Sign up to ${APP_NAME}`}
                </Typography>
            </div>
            <Paper className={classes.signUpPaper}>
                <Collapse className={classes.alert} in={!!store.error}>
                    <Alert severity="error">{store.error}</Alert>
                </Collapse>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={signUp}
                >
                    {({ isSubmitting }) => {
                        return (
                            <Form className={classes.form}>
                                <FormTextField
                                    label="First name"
                                    name="firstName"
                                />
                                <FormTextField
                                    label="Last name"
                                    name="lastName"
                                />
                                <FormTextField
                                    label="Email Address"
                                    name="email"
                                />
                                <FormTextField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                />
                                <SubmitButton
                                    fullWidth
                                    className={classes.submit}
                                    label={!isSubmitting ? t('Agree & Join') : t('Joining')}
                                />
                            </Form>
                        )
                    }}
                </Formik>
            </Paper>
            <Paper className={classes.signInPaper}>
                <div>
                    {`Already on ${APP_NAME}? `}
                    <Link href="/signin">
                        Sign in
                    </Link>
              .
            </div>
            </Paper>
        </div>
    ));
});

export default SignUp;