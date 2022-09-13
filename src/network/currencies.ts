import { CurrenciesEntries, CurrencyList } from '#app/types'
import { bind } from '@react-rxjs/core'
import { left, right, Either } from 'fp-ts/lib/Either'
import { none, Option, some } from 'fp-ts/lib/Option'
import { catchError, of, mergeMap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'

const currencyURL = (date: string, endpoint: string) => `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/${endpoint}`

export interface APIError {
    error: true;
    message: string;
    status?: number;
}

export type CurrenciesResponse = Option<Either<APIError, CurrencyList>>

const currencyEntriesToList = (entries: CurrenciesEntries): CurrencyList => (
    Object.entries(entries).map(([code, title]) => ({ code, title }))
)

export const [useListOfCurrencies] = bind<CurrenciesResponse>(
    fromFetch(currencyURL('latest', 'currencies.min.json'))
        .pipe(
            mergeMap(async response => some(response.ok
                ? right(currencyEntriesToList(await response.json() as CurrenciesEntries))
                : left({ error: true, message: await response.text(), status: response.status } as APIError),
            )),
            catchError(err => of(some(left({
                error: true,
                message: err.message,
            } as APIError)))),
        ),
    none,
)
