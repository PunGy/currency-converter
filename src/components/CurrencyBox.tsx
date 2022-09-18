import { FC } from 'react'
import { Grid, GridProps } from '@mui/material'
import { flow } from 'fp-ts/lib/function'
import { CurrenciesResponse } from '../network/currencies'
import { CurrenciesHistory } from './CurrenciesHistory'
import { CurrencyInput } from './CurrencyInput'
import { CurrencySelector } from './CurrencySelector'
import { Currency, CurrencyList, InputValue } from '#app/types'

const convert = (value: string): InputValue => value === '' ? value : Number(value)
export interface CurrencyBoxProps extends GridProps {
    history: CurrencyList;
    setCurrency: (currency: Currency) => void;
    setValue: (value: InputValue) => void;
    currenciesToSelect: CurrenciesResponse;
    activeCurrency: Currency | null;
    value: InputValue;
    reverse?: boolean;
}
export const CurrencyBox: FC<CurrencyBoxProps> = ({
    currenciesToSelect,
    activeCurrency,
    setCurrency,
    value,
    setValue,
    history,
    reverse = false,
}) => (
    <Grid container direction={reverse ? 'column-reverse' : 'column'} spacing={2}>
        <Grid item>
            <CurrenciesHistory active={activeCurrency} select={setCurrency} list={history} />
        </Grid>
        <Grid item>
            <CurrencySelector currencies={currenciesToSelect} select={setCurrency} value={activeCurrency} />
        </Grid>
        <Grid item>
            <CurrencyInput disabled={activeCurrency == null} onValueChange={flow(convert, setValue)} type="number" value={value} />
        </Grid>
    </Grid>
)
