import * as React from 'react'
import { Autocomplete, createFilterOptions, Box, TextField } from '@mui/material'
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

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ currencies, label, onSelect, value }) => {
  return (
    <Autocomplete
      onChange={(_, value) => value && onSelect(value)}
      filterOptions={filterOptions}
      sx={{ width: 300 }}
      options={currencies}
      value={value}
      autoHighlight
      getOptionLabel={({ code }) => code.toUpperCase()}
      renderOption={(props, option) => (
        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          {/* <img
            loading="lazy"
            width="20"
            src={`https://flagcdn.com/w20/${option.countryCode}.png`}
            srcSet={`https://flagcdn.com/w40/${option.countryCode}.png 2x`}
            alt=""
          /> */}
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
};

export default CurrencySelector