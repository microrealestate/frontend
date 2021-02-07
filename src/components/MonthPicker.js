import moment from 'moment';
import { useState } from 'react';
import { Box, IconButton } from "@material-ui/core";
import { DatePicker } from '@material-ui/pickers';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

const MonthPicker = ({ value, onChange }) => {
    const [selectedPeriod, setSelectedPeriod] = useState(value);

    const _onPeriodChange = period => {
        setSelectedPeriod(period);
        onChange(period);
    }

    const _onNextMonth = () => {
        const newPeriod = moment(selectedPeriod).add(1, 'months');
        _onPeriodChange(newPeriod);
    }

    const _onPreviousMonth = () => {
        const newPeriod = moment(selectedPeriod).subtract(1, 'months');
        _onPeriodChange(newPeriod);
    }

    return (
        <Box display="flex" alignItems="center">
            <IconButton onClick={_onPreviousMonth} aria-label="previous month">
                <ArrowLeftIcon />
            </IconButton>
            <DatePicker
                autoOk
                views={['month']}
                value={selectedPeriod}
                onChange={_onPeriodChange}
                size="small"
                format="MMMM YYYY"
                style={{
                    width: 130
                }}
            />
            <IconButton onClick={_onNextMonth} aria-label="next month" size="small">
                <ArrowRightIcon />
            </IconButton>
        </Box>
    );
}

export default MonthPicker;