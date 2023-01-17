import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { FC } from 'react'

import { createSignal } from '@react-rxjs/utils'
import { map, Observable, scan, combineLatest, tap } from 'rxjs'
import { bind } from '@react-rxjs/core'

import { fold as foldO } from 'fp-ts/Option'
import { findIndex } from 'fp-ts/Array'
import { getOrElse as getOrElseE } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { CurrencyBox } from './components/CurrencyBox'
import { useListOfCurrencies, exchangeRate$, ExchangeRateResponse, APIError } from './network/currencies'
import { SwapCurrenciesButton } from './components/SwapCurrenciesButton'
import { Currency, CurrencyList, ExchangeRate, InputTuple, InputValue } from './types'
import { getCachedHistory, getLatestSelectedCurrency, setLatestSelectedCurrency, saveHistory } from '#app/localStorage'

const [currencyA$, setCurrencyA] = createSignal<Currency>()
const [currencyB$, setCurrencyB] = createSignal<Currency>()

const latestCacheKeyA = 'LATEST_A'
const latestCacheKeyB = 'LATEST_B'

const [useCurrencyA] = bind(
    currencyA$
        .pipe(tap(setLatestSelectedCurrency(latestCacheKeyA))),
    getLatestSelectedCurrency(latestCacheKeyA),
)
const [useCurrencyB] = bind(
    currencyB$
        .pipe(tap(setLatestSelectedCurrency(latestCacheKeyB))),
    getLatestSelectedCurrency(latestCacheKeyB),
)

const MAX_HISTORY_LENGTH = 5
const watchHistory = (currencySource$: Observable<Currency>, cacheKey: string, initialHistory: CurrencyList = []) => currencySource$
    .pipe(
        scan<Currency, CurrencyList>((history, currency) => pipe(
            history,
            findIndex((c: Currency) => c.code == currency.code),
            foldO(
                () => saveHistory(
                    [
                        currency,
                        ...(
                            history.length >= MAX_HISTORY_LENGTH
                                ? history.slice(0, -1)
                                : history
                        ),
                    ],
                    cacheKey,
                ),
                () => history,
            ),
        ), initialHistory),
    )

const historyCacheKeyA = 'HISTORY_A'
const historyCacheKeyB = 'HISTORY_B'

const cachedHistoryA = getCachedHistory(historyCacheKeyA)
const cachedHistoryB = getCachedHistory(historyCacheKeyB)

const historyA$ = watchHistory(currencyA$, historyCacheKeyA, cachedHistoryA)
const historyB$ = watchHistory(currencyB$, historyCacheKeyB, cachedHistoryB)
const [useHistoryA] = bind(historyA$, cachedHistoryA)
const [useHistoryB] = bind(historyB$, cachedHistoryB)

const [inputA$, setInputA] = createSignal<InputTuple>()
const [inputB$, setInputB] = createSignal<InputTuple>()

// Just to simplify to the two possible cases - is exchange rate just OK or not
const exchangeRateOrNull: (response: ExchangeRateResponse) => ExchangeRate | null
    = foldO(
        () => null,
        getOrElseE<APIError, ExchangeRate | null>(() => null),
    )

const watchValue = (
    inputValue$: Observable<InputTuple>,
    inputCurrency$: Observable<Currency>,
    targetCurrency$: Observable<Currency>,
    setTargetValue: (val: InputTuple) => void,
) => (
    combineLatest([inputValue$, inputCurrency$, targetCurrency$, exchangeRate$])
        .pipe(
            map(([
                [value, isSource],
                inputCurrency,
                targetCurrency,
                exchangeRate,
            ]) => {
                if (isSource) {
                    const exchange = exchangeRateOrNull(exchangeRate)
                    if (value !== '') {
                        if (exchange) {
                            const targetValue
                            = (value / exchange.rate[inputCurrency.code]!) // Translate current currency value to basic currency
                            * exchange.rate[targetCurrency.code]! // Translate basic currency to target

                            setTargetValue(
                                /**
                                 * Set target value with second isSource parameter to false
                                 * so it would not recursively change again the current input
                                */
                                [Number(targetValue.toFixed(2)), false],
                            )
                        }
                    } else {
                        setTargetValue(['', false])
                    }
                }
                return value
            }),
        )
)

const [useValueA] = bind(
    watchValue(inputA$, currencyA$, currencyB$, setInputB),
    '',
)

const [useValueB] = bind(
    watchValue(inputB$, currencyB$, currencyA$, setInputA),
    '',
)

const sourceInput = (inputSetter: (tuple: InputTuple) => void) => (value: InputValue) => {
    inputSetter([value, true]) // Setting the right parameter to "true" would trigger the change of the opposite input
}

const App: FC = () => {
    const allCurrenciesList = useListOfCurrencies()
    const valueA = useValueA()
    const valueB = useValueB()

    const historyA = useHistoryA()
    const historyB = useHistoryB()

    const currencyA = useCurrencyA()
    const currencyB = useCurrencyB()

    return (
        <Container maxWidth="sm" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Grid container direction="column">
                <Grid item>
                    <CurrencyBox
                        align="top"
                        value={valueA}
                        setCurrency={setCurrencyA}
                        currenciesToSelect={allCurrenciesList}
                        history={historyA}
                        activeCurrency={currencyA}
                        setValue={sourceInput(setInputA)}
                    />
                </Grid>

                <Grid item>
                    <SwapCurrenciesButton />
                </Grid>

                <Grid item>
                    <CurrencyBox
                        align="bottom"
                        value={valueB}
                        setCurrency={setCurrencyB}
                        currenciesToSelect={allCurrenciesList}
                        history={historyB}
                        activeCurrency={currencyB}
                        setValue={sourceInput(setInputB)}
                    />
                </Grid>
            </Grid>
        </Container>
    )
}

export default App
