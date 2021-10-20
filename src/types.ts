export type Currency = { code: string, label: string }

export type ExchangeRate = {
    date: string;
    currency: string;
    rate: Record<string, number>;
}