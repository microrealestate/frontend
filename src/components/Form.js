
import React, { useState } from 'react';
import { useField } from 'formik';
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

export const CheckboxField = ({ label, ...props }) => {
    const [field] = useField(props);

    return (
        <FormControlLabel
            control={<Checkbox {...field} {...props} />}
            label={label}
        />
    )
};

export const FormTextField = ({ label, ...props }) => {
    const [displayPassword, showPassword] = useState(false);
    const [field, meta] = useField(props);
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
                {...field}
                {...props}
                error={hasError}
                type={(props.type === 'password' && displayPassword) ? 'text' : props.type }
                endAdornment={ props.type === 'password' ? (
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
            />
            { hasError && <FormHelperText error={hasError}>{meta.error}</FormHelperText> }
        </FormControl>
    );
};