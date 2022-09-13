import { FC } from 'react'
import { Grid, GridProps } from '@mui/material'
import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/lib/Either'
import { CurrenciesResponse } from '../network/currencies'
import { CurrenciesNavigator } from './CurrenciesNavigator'
import { CurrencyInput } from './CurrencyInput'
import { CurrencySelector } from './CurrencySelector'
import { Currency, CurrencyList } from '#app/types'

export interface CurrencyBoxProps extends GridProps {
    history: CurrencyList;
    currenciesToSelect: CurrenciesResponse;
    activeCurrency: Currency;
    value: number | null;
    reverse?: boolean;
}
export const CurrencyBox: FC<CurrencyBoxProps> = ({ currenciesToSelect, activeCurrency, value, history, reverse = false }) => (
    <Grid container direction={reverse ? 'column-reverse' : 'column'} spacing={1}>
        <Grid item>
            <CurrenciesNavigator active={activeCurrency} list={history} />
        </Grid>
        <Grid item>
            <CurrencySelector currencies={currenciesToSelect} value={null} />
        </Grid>
        <Grid item>
            <CurrencyInput type="number" value={value} />
        </Grid>
    </Grid>
)
