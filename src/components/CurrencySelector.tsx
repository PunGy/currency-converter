import { Currency, CurrencyList } from '#app/types'
import { Autocomplete, Box, BoxProps, createFilterOptions, TextFieldProps } from '@mui/material'
import { FC } from 'react'
import { CurrencyInput } from './CurrencyInput'
import { fold as foldO } from 'fp-ts/lib/Option'
import { fold as foldE } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { CurrenciesResponse } from '#app/network/currencies'

const filterOptions = createFilterOptions({
    ignoreCase: true,
    stringify: (option: Currency) => option.code + option.title,
})

export interface CurrencySelectorInputProps {
    currencies: CurrencyList;
    value: Currency | null;
}
export const CurrencySelectorInput: FC<CurrencySelectorInputProps> = ({ value, currencies }) => (
    <Autocomplete
        value={value}
        options={currencies}
        filterOptions={filterOptions}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        getOptionLabel={({ code }) => code.toUpperCase()}
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
}
export const CurrencySelector: FC<CurrencySelectorProps> = ({ currencies: currenciesResponse, value }) => (
    pipe(
        currenciesResponse,
        foldO(
            () => <CurrencyInput disabled value="loading currencies..." />,
            (currenciesE) => (
                pipe(
                    currenciesE,
                    foldE(
                        () => <CurrencyInput disabled value="Unable to load currencies" />,
                        (currencies) => <CurrencySelectorInput currencies={currencies} value={value} />,
                    ),
                )
            ),
        ),
    )
)
