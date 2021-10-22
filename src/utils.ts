import { Currency, ExchangeRate } from "./types"

export const callApi: <R = Record<string, string>>(endpoint: string, date?: string) => Promise<R> = (endpoint, date = 'latest') => (
    fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/${endpoint}`)
        .then(data => data.json())
)

export const getLatestCurrenciesList: () => Promise<Array<Currency>> = () => callApi('currencies.json').then((currencies) => (
    Object.entries(currencies).map(([code, label]) => ({ code, label }))
))

export const getExchangeRateFor = (currency: string): Promise<ExchangeRate> => (
    callApi<{ date: string } & { [currency: string]: Record<string, number> }>(`currencies/${currency}.min.json`)
        .then(exchangeRate => ({
            date: exchangeRate.date,
            currency,
            rate: exchangeRate[currency],
        }))
)

export const toAmount = (value: string | null) => value == null ? '' : parseInt(value, 10)
