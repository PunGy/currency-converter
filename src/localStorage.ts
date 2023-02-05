import { identity, flow } from 'fp-ts/function'
import { IOEither, tryCatch } from 'fp-ts/IOEither'
import { IOOption } from 'fp-ts/IOOption'
import { fromNullable, fold } from 'fp-ts/Option'
import { CurrencyList, Currency } from './types'

export const get = (key: string): IOOption<string> => () => fromNullable(localStorage.getItem(key))
export const set = <V>(key: string, value: V): IOEither<any, V> => tryCatch<any, V>(
    () => {
        localStorage.setItem(key, JSON.stringify(value))
        return value
    },
    identity,
)

export const setLatestSelectedCurrency = (key: string) => (currency: Currency | null) => {
    set(key, currency)()
    return currency
}
export const getLatestSelectedCurrency = (key: string): Currency | null => flow(
    get(key),
    fold(
        () => null,
        JSON.parse,
    ),
)()
export const saveHistory = (history: CurrencyList, historyKey: string) => {
    set(historyKey, history)()
    return history
}
export const getCachedHistory = (historyKey: string): CurrencyList => flow(
    get(historyKey),
    fold(
        () => [],
        JSON.parse,
    ),
)()
