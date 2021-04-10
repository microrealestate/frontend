import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Select, MenuItem, CircularProgress, FormLabel, RadioGroup, Radio, Input, InputLabel, FormControl, FormControlLabel, FormHelperText, InputAdornment, IconButton, Checkbox, Typography, Divider, Box, Grid, TextField, Switch } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { RestrictButton, RestrictedComponent } from './RestrictedComponents';
import { withTranslation } from '../utils/i18n';

export const FormTextField = RestrictedComponent(({ label, disabled, ...props }) => {
  const [displayPassword, showPassword] = useState(false);
  const [field, meta] = useField(props);
  const { isSubmitting } = useFormikContext();
  const hasError = !!(meta.touched && meta.error);

  const handleClickShowPassword = useCallback(() => {
    showPassword(displayPassword => !displayPassword);
  }, []);

  const handleMouseDownPassword = useCallback(event => {
    event.preventDefault();
  }, []);

  return (
    <FormControl
      margin="normal"
      fullWidth
    >
      <InputLabel htmlFor={props.name} error={hasError}>{label}</InputLabel>
      <Input
        error={hasError}
        endAdornment={props.type === 'password' ? (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
            >
              {displayPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ) : null}
        disabled={disabled || isSubmitting}
        {...props}
        {...field}
        type={(props.type === 'password' && displayPassword) ? 'text' : props.type}
      />
      {hasError && <FormHelperText error={hasError}>{meta.error}</FormHelperText>}
    </FormControl>
  );
});

export const SelectField = RestrictedComponent(({ label, values = [], disabled, children, ...props }) => {
  const [field, meta] = useField(props);
  const { isSubmitting } = useFormikContext();
  const hasError = !!(meta.touched && meta.error);

  return (
    <FormControl
      margin="normal"
      fullWidth
    >
      <InputLabel htmlFor={props.name} error={hasError}>{label}</InputLabel>
      <Select
        disabled={disabled || isSubmitting}
        error={hasError}
        {...field}
        {...props}
      >
        {values.map(({ id, value, label, disabled: disabledMenu }) => (
          <MenuItem key={id} value={value} disabled={disabledMenu}>{label}</MenuItem>
        ))}
      </Select>
      {hasError && <FormHelperText error={hasError}>{meta.error}</FormHelperText>}
    </FormControl>
  );
});

export const RadioFieldGroup = ({ children, label, ...props }) => {
  const [field, meta] = useField(props);
  const hasError = !!(meta.touched && meta.error);

  return (
    <Box pt={2}>
      <FormControl component="fieldset" error={hasError}>
        <FormLabel component="legend">{label}</FormLabel>
        <RadioGroup
          {...props}
          {...field}
        >
          {children}
        </RadioGroup>
        {hasError && <FormHelperText error={hasError}>{meta.error}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export const RadioField = ({ onlyRoles, disabled, ...props }) => {
  const { isSubmitting } = useFormikContext();

  const RestrictedRadio = RestrictedComponent(Radio);
  return (
    <FormControlLabel
      control={
        <RestrictedRadio color="default" disabled={disabled || isSubmitting} onlyRoles={onlyRoles} />
      }
      {...props}
    />
  );
};

export const CheckboxField = RestrictedComponent(({ label, disabled, ...props }) => {
  const [field] = useField(props);
  const { isSubmitting } = useFormikContext();

  return (
    <FormControlLabel
      control={
        <Checkbox
          color="default"
          checked={field.value}
          {...props}
          {...field}
        />
      }
      label={label}
      disabled={disabled || isSubmitting}
    />
  )
});

export const SwitchField = RestrictedComponent(({ label, disabled, ...props }) => {
  const [field] = useField(props);
  const { isSubmitting } = useFormikContext();

  return (
    <FormControlLabel
      control={
        <Switch
          color="default"
          checked={field.value}
          {...props}
          {...field}
        />
      }
      label={label}
      disabled={disabled || isSubmitting}
    />
  )
});

export const DateField = RestrictedComponent(({ disabled, ...props }) => {
  const [field, meta] = useField(props.name);
  const { setFieldValue, setFieldTouched, handleBlur, isSubmitting } = useFormikContext();
  const hasError = !!(meta.touched && meta.error);

  return (
    <FormControl
      margin="normal"
      fullWidth
    >
      <KeyboardDatePicker
        name={field.name}
        value={field.value}
        format={moment.localeData().longDateFormat('L')}
        error={hasError}
        helperText={hasError ? meta.error : ''}
        onChange={date => {
          setFieldValue(field.name, date)
          setFieldTouched(field.name, true);
        }}
        autoOk
        disabled={disabled || isSubmitting}
        TextFieldComponent={(textProps) => (
          <TextField
            {...textProps}
            onBlur={handleBlur}
          />
        )}
        {...props}
      />
    </FormControl>
  )
});

const defaultMinDate = moment('1900-01-01', 'YYYY-MM-DD');
const defaultMaxDate = moment('2100-01-01', 'YYYY-MM-DD');
export const DateRangeField = ({ beginName, endName, beginLabel, endLabel, minDate, maxDate, duration, disabled }) => {
  const { setFieldValue } = useFormikContext();
  const [beginField] = useField(beginName);
  const [endField] = useField(endName);

  useEffect(() => {
    if (duration && beginField.value) {
      const newEndDate = moment(beginField.value.startOf('day')).add(duration).subtract(1, 'second');
      if (!newEndDate.isSame(endField.value)) {
        setFieldValue(endName, newEndDate, true);
      }
    }
  }, [duration, beginField.value])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <DateField
          label={beginLabel}
          name={beginName}
          minDate={(minDate || defaultMinDate).toISOString()}
          maxDate={(maxDate || defaultMaxDate).toISOString()}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DateField
          label={endLabel}
          name={endName}
          minDate={(beginField.value || minDate || defaultMinDate).toISOString()}
          maxDate={(maxDate || defaultMaxDate).toISOString()}
          disabled={disabled || !!duration}
        />
      </Grid>
    </Grid>
  );
}

export const SubmitButton = ({ label, ...props }) => {
  const { isValid, isSubmitting } = useFormikContext();
  return (
    <RestrictButton
      type="submit"
      variant="contained"
      color="primary"
      disabled={!isValid || isSubmitting}
      endIcon={isSubmitting ? <CircularProgress color="inherit" size={20} /> : null}
      {...props}
    >
      {label}
    </RestrictButton>
  );
};

export const FormSection = ({ label, children }) => {

  return (
    <Box pb={4}>
      <Typography variant="h5">{label}</Typography>
      <Box pt={2} pb={1}>
        <Divider />
      </Box>
      {children}
    </Box>
  );
};

export const ContactForm = withTranslation()(({ t, contactName, emailName, phone1Name, phone2Name, onlyRoles, disabled }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormTextField
          label={t('Contact')}
          name={contactName || "contact"}
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormTextField
          label={t('Email')}
          name={emailName || "email"}
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormTextField
          label={t('Phone 1')}
          name={phone1Name || "phone1"}
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} md={4}>

        <FormTextField
          label={t('Phone 2')}
          name={phone2Name || "phone2"}
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
});

export const AddressField = withTranslation()(({ t, onlyRoles, disabled }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormTextField
          label={t('Street')}
          name="street1"
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12}>
        <FormTextField
          label={t('Street')}
          name="street2"
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormTextField
          label={t('Zip code')}
          name="zipCode"
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormTextField
          label={t('City')}
          name="city"
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} md={6}>

        <FormTextField
          label={t('State')}
          name="state"
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormTextField
          label={t('Country')}
          name="country"
          onlyRoles={onlyRoles}
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
});
