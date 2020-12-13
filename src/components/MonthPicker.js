import moment from 'moment';
import { useState } from 'react';
import { Grid, IconButton } from "@material-ui/core";
import DateFnsUtils from '@date-io/moment';
import {
  DatePicker, MuiPickersUtilsProvider,
} from '@material-ui/pickers';
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
        <Grid container alignItems="center" wrap="nowrap">
            <Grid item>
                <IconButton onClick={_onPreviousMonth} aria-label="previous month">
                    <ArrowLeftIcon />
                </IconButton>
            </Grid>
            <Grid item>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}> */}
                    <DatePicker
                        autoOk
                        views={['month']}
                        value={selectedPeriod}
                        onChange={_onPeriodChange}
                        size="small"
                        format="MMMM YYYY"
                    />
                {/* </MuiPickersUtilsProvider> */}
            </Grid>
            <Grid item>
                <IconButton onClick={_onNextMonth} aria-label="next month">
                    <ArrowRightIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
}

export default MonthPicker;