import React from 'react';
import { useObserver } from 'mobx-react';
import { useParams } from "@reach/router"
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { useStore } from '../../store';
import { FormTextField } from '../../components/Form';

import { useStyles } from './ResetPassword.styles';

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

export default props => {
  const { navigate } = props;
  const { store, store: { user } } = useStore();
  const { resetToken } = useParams();
  const classes = useStyles();

  const resetPassword = async ({ password }, actions) => {
    await user.resetPassword(resetToken, password);
    if (!store.error) {
      await navigate(`${process.env.PUBLIC_URL}/signin`, { replace: true });
    }
  };

  const signIn = async event => {
    event.preventDefault();
    await navigate(`${process.env.PUBLIC_URL}/signin`);
  };

  return useObserver(() => (
    <main className={classes.main}>
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
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                  >
                    Reset my password
                  </Button>
                </div>
              </Form>
            )
          }}
        </Formik>
      </Paper>
    </main>
  ));
};