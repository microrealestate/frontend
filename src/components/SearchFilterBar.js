import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import { Box, TextField, InputAdornment } from '@material-ui/core';
import { withTranslation } from 'next-i18next';
import { useState, useEffect, useCallback, useMemo } from 'react';
import ToggleMenu from './ToggleMenu';

const SearchFilterBar = withTranslation()(
  ({ t, filters, onSearch, defaultValue = { status: '', searchText: '' } }) => {
    const [filter, setFilter] = useState(defaultValue.status);
    const [searchText, setSearchText] = useState(defaultValue.searchText);

    useEffect(() => {
      const timer = setTimeout(() => {
        onSearch(filter, searchText);
      }, 250);
      return () => clearTimeout(timer);
    }, [filter, searchText]);

    return (
      <Box display="flex" alignItems="center">
        <Box flexGrow={1}>
          <TextField
            // fullWidth
            // size="medium"
            placeholder={t('Search')}
            defaultValue={defaultValue.searchText}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={useCallback(
              (event) => setSearchText(event.target.value || ''),
              []
            )}
            style={{
              width: '400px',
            }}
          />
        </Box>
        <Box>
          <ToggleMenu
            startIcon={<FilterListIcon />}
            options={filters}
            value={useMemo(
              () =>
                filters.find((f) => f.id === defaultValue.status) || filters[0],
              [defaultValue, filters]
            )}
            onChange={useCallback((option) => setFilter(option.id), [])}
          />
        </Box>
      </Box>
    );
  }
);

export default SearchFilterBar;
