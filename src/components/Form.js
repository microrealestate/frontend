import moment from 'moment';
import { useState } from 'react';
import { useField, useFormikContext } from 'formik';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import { Select, MenuItem, CircularProgress, Button, FormLabel, RadioGroup, Radio } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';

export const CheckboxField = ({ label, ...props }) => {
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
};

export const FormTextField = ({ label, ...props }) => {
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
        type={(props.type === 'password' && displayPassword) ? 'text' : props.type}
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
      />
      {hasError && <FormHelperText error={hasError}>{meta.error}</FormHelperText>}
    </FormControl>
  );
};

export const SelectField = ({ label, value: inialValue, values = [], ...props }) => {
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
};

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

export const RadioField = (props) => {
  const { isSubmitting } = useFormikContext();

  return (
    <FormControlLabel
      control={
        <Radio color="default" />
      }
      {...props}
      disabled={isSubmitting}
    />
  );
};

export const DateField = (props) => {
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
};

export const SubmitButton = ({ label, ...props }) => {
  const { isValid, isSubmitting } = useFormikContext();
  return (
    <Button
      type="submit"
      variant="contained"
      color="primary"
      disabled={!isValid || isSubmitting}
      endIcon={isSubmitting ? <CircularProgress color="inherit" size={20} /> : null}
      {...props}
    >
      {label}
    </Button>
  );
};