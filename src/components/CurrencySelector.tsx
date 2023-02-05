import { Currency, CurrencyList } from '#app/types'
import Box, { BoxProps } from '@mui/material/Box'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import type { TextFieldProps } from '@mui/material/TextField'
import { FC } from 'react'
import { CurrencyInput } from './CurrencyInput'
import { fold as foldO } from 'fp-ts/Option'
import { fold as foldE } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { CurrenciesResponse } from '#app/network/currencies'

const filterOptions = createFilterOptions({
    ignoreCase: true,
    stringify: (option: Currency) => option.code + option.title,
})

export interface CurrencySelectorInputProps {
    currencies: CurrencyList;
    value: Currency | null;
    select: (currency: Currency) => void;
}
export const CurrencySelectorInput: FC<CurrencySelectorInputProps> = ({ value, currencies, select }) => (
    <Autocomplete
        value={value}
        options={currencies}
        filterOptions={filterOptions}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        getOptionLabel={({ code }) => (
            code
                ? code.toUpperCase()
                : ''
        )}
        onChange={(_, value) => value && select(value)}
        autoHighlight
        renderOption={(props, option) => (
            <Box component="li" {...props as BoxProps}>
                ({option.code.toUpperCase()}) {option.title}
            </Box>
        )}
        renderInput={(params) => (
            <CurrencyInput
                {...params as TextFieldProps}
                label="Select currency"
                inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} // disable autocomplete and autofill
            />
        )}
    />
)

export interface CurrencySelectorProps {
    currencies: CurrenciesResponse;
    value: Currency | null;
    select: (currency: Currency) => void;
}
export const CurrencySelector: FC<CurrencySelectorProps> = ({ currencies: currenciesResponse, value, select }) => (
    pipe(
        currenciesResponse,
        foldO(
            () => <CurrencyInput disabled value="loading currencies..." />,
            (currenciesE) => (
                pipe(
                    currenciesE,
                    foldE(
                        () => <CurrencyInput disabled value="Unable to load currencies" />,
                        (currencies) => <CurrencySelectorInput select={select} currencies={currencies} value={value} />,
                    ),
                )
            ),
        ),
    )
)
