export interface Currency {
    code: string; // For example "usd"
    title: string; // For example "United States dollar"
}

export type CurrencyList = Array<Currency>

export type CurrenciesEntries = Record<
    Currency['code'],
    Currency['title']
>

export interface ExchangeRate {
    date: string;
    currency: string;
    rate: Record<string, number>;
}

export type InputValue = number | ''
export type InputTuple = [
    number | '', // Value of an input
    boolean, // Is this input a source (so it should change )
]
