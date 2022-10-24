import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { FC } from 'react'

import { createSignal } from '@react-rxjs/utils'
import { map, Observable, scan, combineLatest } from 'rxjs'
import { bind } from '@react-rxjs/core'

import { fold as foldO } from 'fp-ts/Option'
import { findIndex } from 'fp-ts/Array'
import { getOrElse as getOrElseE } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { CurrencyBox } from './components/CurrencyBox'
import { useListOfCurrencies, exchangeRate$, ExchangeRateResponse, APIError } from './network/currencies'
import { SwapCurrenciesButton } from './components/SwapCurrenciesButton'
import { Currency, CurrencyList, ExchangeRate, InputTuple, InputValue } from './types'
import * as cacheLocalStorage from '#app/localStorage'

const [currencyA$, setCurrencyA] = createSignal<Currency>()
const [currencyB$, setCurrencyB] = createSignal<Currency>()

const [useCurrencyA] = bind(currencyA$, null)
const [useCurrencyB] = bind(currencyB$, null)

const saveHistory = (history: CurrencyList, historyKey: string) => {
    cacheLocalStorage.set(historyKey, history)()
    return history
}
const getCachedHistory = (historyKey: string): CurrencyList => pipe(cacheLocalStorage.get(historyKey)(), foldO(
    () => [],
    JSON.parse,
))

const watchHistory = (currencySource$: Observable<Currency>, cacheKey: string, initialHistory: CurrencyList = []) => currencySource$
    .pipe(
        scan<Currency, CurrencyList>((history, currency) => pipe(
            history,
            findIndex((c: Currency) => c.code == currency.code),
            foldO(
                () => saveHistory([currency, ...history], cacheKey),
                () => history,
            ),
        ), initialHistory),
    )

const historyCacheKeyA = 'HISTORY_A'
const historyCacheKeyB = 'HISTORY_B'

const cachedHistoryA = getCachedHistory(historyCacheKeyA)
const cachedHistoryB = getCachedHistory(historyCacheKeyB)

const [useHistoryA] = bind(watchHistory(currencyA$, historyCacheKeyA, cachedHistoryA), cachedHistoryA)
const [useHistoryB] = bind(watchHistory(currencyB$, historyCacheKeyB, cachedHistoryB), cachedHistoryB)

const [inputA$, setInputA] = createSignal<InputTuple>()
const [inputB$, setInputB] = createSignal<InputTuple>()

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
    inputSetter([value, true])
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
                        reverse
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
