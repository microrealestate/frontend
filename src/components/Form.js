
import React from 'react';
import { useField, ErrorMessage } from 'formik';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';

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
    const [field, meta/*, helpers*/] = useField(props);
    const hasError = meta.touched && meta.error;

    return (
        <TextField
            label={label}
            {...field}
            {...props}
            error={hasError}
            helperText={<ErrorMessage name={props.name} />}
            margin="normal"
            fullWidth
        />
    );
};