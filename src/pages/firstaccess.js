import React, { useContext, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { FormTextField, SubmitButton, RadioFieldGroup, RadioField } from '../components/Form';

import { withTranslation } from '../utils/i18n';
import { withAuthentication } from '../components/Authentication';
import { Typography, Box, Paper } from '@material-ui/core';
import { StoreContext } from '../store';
import { useStyles } from '../styles/pages/FirstAccess.styles';
import Page from '../components/Page';

const initialValues = {
    name: '',
    isCompany: false,
    company: '',
    email: ''
};

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Required'),
    isCompany: Yup.boolean()
        .required('Required'),
    company: Yup.mixed().when('isCompany', {
        is: true,
        then: Yup.string().required(),
        otherwise: Yup.string()
    }),
    // company: Yup.string().required(),
    email: Yup.mixed().when('isCompany', {
        is: true,
        then: Yup.string().email().required(),
        otherwise: Yup.string().email()
    })
});


const FirstAccess = withTranslation()(({ t }) => {
    const store = useContext(StoreContext);
    const [value, setValue] = useState(false);
    const classes = useStyles();

    const handleChange = (event) => {
        setValue(event.target.value === "true");
    };

    const onSubmit = async ({ name, isCompany, company, email }, actions) => {
        try {
            await new Promise(res => setTimeout(() => {res()}, 3000));
            //   await store.organization.create({
            //       name,
            //       isCompany,
            //       company: isCompany ? company : '',
            //       email: isCompany ? email : store.user.email,
            //       admin: store.user.email
            //   });
        } catch (error) {
            console.error(error);
        }
    };

    return useObserver(() => (
        <Page>
            <div className={classes.main}>
                <Box paddingTop={2} paddingBottom={2}>
                    <Typography variant="h3" align="center">
                        {t('Welcome {{firstName}} {{lastName}}!', { firstName: store.user.firstName, lastName: store.user.lastName })}
                    </Typography>
                </Box>
                <Box paddingBottom={4}>
                    <Typography variant="subtitle2" align="center" color="textSecondary">
                        {t('One more step. Tell us who will rent your property')}
                    </Typography>
                </Box>
            <Paper className={classes.paper}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ isSubmitting }) => {
                        return (
                            <Form className={classes.form} autoComplete="off">
                                <Box paddingBottom={4}>
                                    <FormTextField
                                        label={t('Landlord name')}
                                        name="name"
                                    />
                                </Box>
                                <Box>
                                    <RadioFieldGroup
                                        aria-label="organization type"
                                        label={t('The landlord belongs to')}
                                        name="isCompany"
                                        value={value}
                                        onChange={handleChange}
                                    >
                                        <RadioField value={false} label={`${t('My personal account')} (${store.user.firstName} ${store.user.lastName})`} />
                                        <RadioField value={true} label={t('A business or institution')} />
                                    </RadioFieldGroup>
                                </Box>
                                {value && (
                                    <Box>
                                        <FormTextField
                                            label={t('Name of business or institution')}
                                            name="company"
                                        />
                                        <FormTextField
                                            label={t('Contact email')}
                                            name="email"
                                        />
                                    </Box>
                                )}
                                <Box paddingTop={4}>
                                    <SubmitButton
                                        size="large"
                                        fullWidth
                                        label={!isSubmitting ? t('Next') : t('Submitting')}
                                    />
                                </Box>
                            </Form>
                        )
                    }}
                </Formik>
            </Paper>
            </div>
        </Page>
    ));
});


export default withAuthentication(FirstAccess);






