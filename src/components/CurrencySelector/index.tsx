import * as React from 'react'

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'

import type { Currency } from '../../types'

interface CurrencySelectorProps {
  currencies: Array<Currency>;
  label: string;
  onSelect: (currency: Currency) => void;
  value: Currency | null;
}

const filterOptions = createFilterOptions({
  ignoreCase: true,
  stringify: (option: Currency) => option.code + option.label,
})

const CurrencySelector: React.FC<CurrencySelectorProps> = React.memo(({ currencies, label, onSelect, value }) => {
  return (
    <Autocomplete
      onChange={(_, value) => value && onSelect(value)}
      filterOptions={filterOptions}
      sx={{ width: 300 }}
      options={currencies}
      value={value}
      autoHighlight
      getOptionLabel={({ code }) => code.toUpperCase()}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          ({option.code.toUpperCase()}) {option.label}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  )
});

export default CurrencySelector