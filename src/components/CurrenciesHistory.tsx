import { FC } from 'react'
import { Stack, Chip } from '@mui/material'
import { grey } from '@mui/material/colors'
import { Currency, CurrencyList } from '#app/types'
import { pipe } from 'fp-ts/lib/function'

export interface CurrenciesHistoryProps {
    list: CurrencyList;
    active: Currency | null;
    select: (currency: Currency) => void;
}

export const CurrenciesHistory: FC<CurrenciesHistoryProps> = ({ list, active, select }) => (
    <Stack direction="row" spacing={1}>
        {list.map(currency => (
            pipe(
                active !== null && active.code === currency.code,
                (isActive) => (
                    <Chip
                        sx={{
                            backgroundColor: theme => isActive ? theme.palette.primary.light : grey[100],
                            border: theme => `1px solid ${isActive ? theme.palette.primary.dark : grey[600]}`,
                            '&:hover': {
                                backgroundColor: theme => isActive ? theme.palette.primary.light : grey[300],
                            },
                        }}
                        color={isActive ? 'primary' : 'default'}
                        label={currency.code.toUpperCase()}
                        onClick={() => select(currency)}
                        clickable
                        key={currency.code}
                    />
                ),
            )
        ))}
    </Stack>
)
