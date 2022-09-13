export interface Currency {
    code: string; // For example "usd"
    title: string; // For example "United States dollar"
}

export type CurrencyList = Array<Currency>

export type CurrenciesEntries = Record<
    Currency['code'],
    Currency['title']
>
