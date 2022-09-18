import * as cacheLocalStorage from '#app/localStorage'
import { CurrenciesEntries, CurrencyList, ExchangeRate } from '#app/types'

import * as E from 'fp-ts/lib/Either'
import * as IOO from 'fp-ts/lib/IOOption'
import * as IO from 'fp-ts/lib/IO'
import * as O from 'fp-ts/lib/Option'

import { catchError, of, mergeMap, switchMap, map, iif, tap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { bind } from '@react-rxjs/core'
import { createSignal } from '@react-rxjs/utils'
import { flow, pipe } from 'fp-ts/lib/function'
import { EXCHANGE_DATE_KEY, EXCHANGE_RATE_KEY } from '#app/constants'

const currencyURL = (date: string, endpoint: string) => `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/${endpoint}`

export interface APIError {
    error: true;
    message: string;
    status?: number;
}

export type APIResponse<T> = O.Option<E.Either<APIError, T>>
export type CurrenciesResponse = APIResponse<CurrencyList>
export type ExchangeRateResponse = APIResponse<ExchangeRate>

const currencyEntriesToList = (entries: CurrenciesEntries): CurrencyList => (
    Object.entries(entries).map(([code, title]) => ({ code, title }))
)

const mapResponse = <T>() => async (response: Response): Promise<T> => response.ok
    ? response.json()
    : response.text().then((reason) => Promise.reject(reason))

const mapError = (err: any) => of(O.some(E.left({ error: true, message: err.message } as APIError)))

export const [useListOfCurrencies] = bind<CurrenciesResponse>(
    fromFetch(currencyURL('latest', 'currencies.min.json'))
        .pipe(
            mergeMap(mapResponse<CurrenciesEntries>()),
            map(flow(currencyEntriesToList, E.right, O.some)),
            catchError(mapError),
        ),
    O.none,
)

export const [exchangeRateDate$, setExchangeRateDate] = createSignal<string>()

const cachedExchangeDate = pipe(
    cacheLocalStorage.get(EXCHANGE_DATE_KEY),
    IOO.getOrElse(() => IO.of('latest')),
)
setExchangeRateDate(cachedExchangeDate())

const cachedExchangeRate: IO.IO<ExchangeRateResponse> = pipe(
    cacheLocalStorage.get(EXCHANGE_RATE_KEY),
    IOO.map(
        flow(JSON.parse, E.right),
    ),
)

interface ExchangeRateRaw {
    date: string;
    'usd': Record<string, number>;
}
const mapExchangeResponseToRate = (exchangeResponse: ExchangeRateRaw): ExchangeRate => ({
    date: exchangeResponse.date,
    currency: 'usd',
    rate: exchangeResponse.usd,
})
const setCachedExchangeRate = (exchangeRate: ExchangeRate) => cacheLocalStorage.set(EXCHANGE_RATE_KEY, exchangeRate)()

// Strategies of execution
const FETCH_EXCHANGE = false
const USE_CACHED = true
export const [useExchangeRate, exchangeRate$] = bind<ExchangeRateResponse>(
    exchangeRateDate$.pipe(
        tap(console.log),
        switchMap((date) => (
            pipe(
                cachedExchangeRate(),
                (cached) => (
                    iif(
                        () => (
                            pipe(
                                cachedExchangeRate(),
                                O.fold(
                                    () => FETCH_EXCHANGE,
                                    (cached) => (cached as E.Right<ExchangeRate>).right.date === date ? USE_CACHED : FETCH_EXCHANGE,
                                ),
                            )
                        ),
                        of(cached),
                        fromFetch(currencyURL(date, 'currencies/usd.min.json'))
                            .pipe(
                                mergeMap(mapResponse<ExchangeRateRaw>()),
                                map(flow(mapExchangeResponseToRate, setCachedExchangeRate, O.some)),
                                catchError(mapError),
                            ),
                    )
                ),
            )
        )),
    ),
    cachedExchangeRate(),
)

setExchangeRateDate('latest')
