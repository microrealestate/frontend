import { useState, useEffect, useCallback } from 'react';
import { withTranslation } from 'next-i18next';
import { TextField, InputAdornment } from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';

const SearchBar = withTranslation()(({ t, onSearch, defaultValue = '' }) => {
  const [searchText, setSearchText] = useState(defaultValue);

  useEffect(() => {
    const interval = setInterval(() => {
      onSearch(searchText);
    }, 250);
    return () => clearInterval(interval);
  }, [searchText, onSearch]);

  const onChange = useCallback(
    (event) => setSearchText(event.target.value || ''),
    []
  );

  return (
    <TextField
      fullWidth
      placeholder={t('Search')}
      defaultValue={defaultValue}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      onChange={onChange}
    />
  );
});

export default SearchBar;
