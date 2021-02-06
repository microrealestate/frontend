import moment from 'moment';
import { useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Select, MenuItem, CircularProgress, FormLabel, RadioGroup, Radio, Input, InputLabel, FormControl, FormControlLabel, FormHelperText, InputAdornment, IconButton, Checkbox } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { RestrictButton, RestrictedComponent } from './RestrictedComponents';

export const CheckboxField = RestrictedComponent(({ label, ...props }) => {
  const [field] = useField(props);
  const { isSubmitting } = useFormikContext();

  return (
    <FormControlLabel
      control={
        <Checkbox
          {...props}
          {...field}
        />
      }
      label={label}
      disabled={isSubmitting}
    />
  )
});

export const FormTextField = RestrictedComponent(({ label, ...props }) => {
  const [displayPassword, showPassword] = useState(false);
  const [field, meta] = useField(props);
  const { isSubmitting } = useFormikContext();
  const hasError = !!(meta.touched && meta.error);

  const handleClickShowPassword = () => {
    showPassword(!displayPassword);
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

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
        disabled={isSubmitting}
        {...props}
        {...field}
        type={(props.type === 'password' && displayPassword) ? 'text' : props.type}
      />
      {hasError && <FormHelperText error={hasError}>{meta.error}</FormHelperText>}
    </FormControl>
  );
});

export const SelectField = RestrictedComponent(({ label, value: inialValue, values = [], ...props }) => {
  const [field, meta] = useField(props);
  const [value, setValue] = useState(inialValue);
  const { isSubmitting } = useFormikContext();
  const hasError = !!(meta.touched && meta.error);

  const handleChange = (event) => {
    setValue(event.target.value);
  };
  return (
    <FormControl
      margin="normal"
      fullWidth
    >
      <InputLabel htmlFor={props.name} error={hasError}>{label}</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        disabled={isSubmitting}
        error={hasError}
        {...props}
        {...field}
      >
        {values.map(({ id, label, value }) => (
          <MenuItem key={id} value={value}>{label}</MenuItem>
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
  );
};

export const RadioField = ({onlyRoles, ...props}) => {
  const { isSubmitting } = useFormikContext();

  const RestrictedRadio = RestrictedComponent(Radio);
  return (
    <FormControlLabel
      control={
        <RestrictedRadio color="default" disabled={isSubmitting} onlyRoles={onlyRoles}/>
      }
      {...props}
    />
  );
};

export const DateField = RestrictedComponent((props) => {
  const [field, meta, helper] = useField(props.name);
  const { isSubmitting } = useFormikContext();
  const hasError = !!(meta.touched && meta.error);

  field.onChange = date => helper.setValue(date);

  return (
    <FormControl
      margin="normal"
      fullWidth
    >
      <KeyboardDatePicker
        // clearable
        error={hasError}
        helperText={hasError ? meta.error : ''}
        placeholder={moment().format('L')}
        format={moment.localeData().longDateFormat('L')}
        disabled={isSubmitting}
        autoOk
        variant="inline"
        {...props}
        {...field}
      />
    </FormControl>
  )
});

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