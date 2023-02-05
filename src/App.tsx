import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { FC, useEffect } from 'react'

import { createSignal } from '@react-rxjs/utils'
import { map, Observable, combineLatest, tap } from 'rxjs'
import { bind } from '@react-rxjs/core'

import { fold as foldO } from 'fp-ts/Option'
import { getOrElse as getOrElseE } from 'fp-ts/Either'

import { CurrencyBox } from './components/CurrencyBox'
import { useListOfCurrencies, exchangeRate$, ExchangeRateResponse, APIError } from './network/currencies'
import { SwapCurrenciesButton } from './components/SwapCurrenciesButton'
import { Currency, ExchangeRate, InputTuple, InputValue } from './types'
import { getCachedHistory, getLatestSelectedCurrency, setLatestSelectedCurrency } from '#app/localStorage'
import { Action, watchCurrency, watchHistory } from '#app/actions'

const [historyActionA$, dispatchHistoryActionA] = createSignal<Action>()
const [historyActionB$, dispatchHistoryActionB] = createSignal<Action>()

const latestCacheKeyA = 'LATEST_A'
const latestCacheKeyB = 'LATEST_B'

const cachedCurrencyA = getLatestSelectedCurrency(latestCacheKeyA)
const cachedCurrencyB = getLatestSelectedCurrency(latestCacheKeyB)

const currencyA$ = watchCurrency(historyActionA$, cachedCurrencyA)
const currencyB$ = watchCurrency(historyActionB$, cachedCurrencyB)

const [useCurrencyA] = bind(
    currencyA$.pipe(tap(setLatestSelectedCurrency(latestCacheKeyA))),
    cachedCurrencyA,
)
const [useCurrencyB] = bind(
    currencyB$.pipe(tap(setLatestSelectedCurrency(latestCacheKeyB))),
    cachedCurrencyB,
)

const historyCacheKeyA = 'HISTORY_A'
const historyCacheKeyB = 'HISTORY_B'

const cachedHistoryA = getCachedHistory(historyCacheKeyA)
const cachedHistoryB = getCachedHistory(historyCacheKeyB)

const historyA$ = watchHistory(historyActionA$, historyCacheKeyA, cachedHistoryA)
const historyB$ = watchHistory(historyActionB$, historyCacheKeyB, cachedHistoryB)
const [useHistoryA] = bind(historyA$, cachedHistoryA)
const [useHistoryB] = bind(historyB$, cachedHistoryB)

const [inputA$, setInputA] = createSignal<InputTuple>()
const [inputB$, setInputB] = createSignal<InputTuple>()

/**

 */

// Just to simplify to the two possible cases - is exchange rate just OK or not
const exchangeRateOrNull: (response: ExchangeRateResponse) => ExchangeRate | null
    = foldO(
        () => null,
        getOrElseE<APIError, ExchangeRate | null>(() => null),
    )

const watchValue = (
    inputValue$: Observable<InputTuple>,
    inputCurrency$: Observable<Currency | null>,
    targetCurrency$: Observable<Currency | null>,
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
                        if (exchange && inputCurrency && targetCurrency) {
                            const targetValue
                            = (value / exchange.rate[inputCurrency.code]!) // Translate current currency value to basic currency
                            * exchange.rate[targetCurrency.code]! // Translate basic currency to target

                            setTargetValue(
                                /**
                                 * Set target value with second isSource parameter to false,
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

    const setValueA = sourceInput(setInputA)
    const setValueB = sourceInput(setInputB)

    useEffect(() => {
        if (currencyA) {
            setValueA(1)
        }
    }, [])

    return (
        <Container maxWidth="sm" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Grid container direction="column">
                <Grid item>
                    <CurrencyBox
                        align="top"
                        value={valueA}
                        currenciesToSelect={allCurrenciesList}
                        history={historyA}
                        activeCurrency={currencyA}
                        dispatchAction={dispatchHistoryActionA}
                        setValue={setValueA}
                    />
                </Grid>

                <Grid item>
                    <SwapCurrenciesButton />
                </Grid>

                <Grid item>
                    <CurrencyBox
                        align="bottom"
                        value={valueB}
                        currenciesToSelect={allCurrenciesList}
                        history={historyB}
                        activeCurrency={currencyB}
                        dispatchAction={dispatchHistoryActionB}
                        setValue={setValueB}
                    />
                </Grid>
            </Grid>
        </Container>
    )
}

export default App
