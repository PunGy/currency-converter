import { CurrenciesEntries, CurrencyList, ExchangeRate } from '#app/types'

import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'

import { catchError, of, mergeMap, switchMap, map, startWith } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { bind } from '@react-rxjs/core'
import { createSignal } from '@react-rxjs/utils'
import { flow } from 'fp-ts/function'
import { DEFAULT_EXCHANGE_DATE } from '#app/constants'

const currencyURL = (date: string, endpoint: string) => `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/${endpoint}`

export const [exchangeRateDate$, setExchangeRateDate] = createSignal<string>()

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
    exchangeRateDate$
        .pipe(
            startWith(DEFAULT_EXCHANGE_DATE),
            switchMap((date) => fromFetch(currencyURL(date, 'currencies.min.json'))
                .pipe(
                    mergeMap(mapResponse<CurrenciesEntries>()),
                    map(flow(currencyEntriesToList, E.right, O.some)),
                    catchError(mapError),
                ),
            ),
        ),
    O.none,
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

export const [useExchangeRate, exchangeRate$] = bind<ExchangeRateResponse>(
    exchangeRateDate$.pipe(
        startWith(DEFAULT_EXCHANGE_DATE),
        switchMap((date) => fromFetch(currencyURL(date, 'currencies/usd.min.json'))
            .pipe(
                mergeMap(mapResponse<ExchangeRateRaw>()),
                map(flow(mapExchangeResponseToRate, E.right, O.some)),
                catchError(mapError),
            )),
    ),
)

