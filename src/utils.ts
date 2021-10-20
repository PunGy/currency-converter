import { Currency } from "./types"

export const callApi: (endpoint: string, date?: string) => Promise<Record<string, string>> = (endpoint, date = 'latest') => (
    fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/${endpoint}`)
        .then(data => data.json())
)

export const getLatestCurrenciesList: () => Promise<Array<Currency>> = () => callApi('currencies.json').then((currencies) => (
    Object.entries(currencies).map(([code, label]) => ({ code, label }))
))

export const toAmount = (value: string) => value === '' ? null : parseInt(value, 10)
