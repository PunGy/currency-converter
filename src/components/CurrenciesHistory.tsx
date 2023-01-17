import { FC, useCallback, useState } from 'react'
import Stack from '@mui/material/Stack'
import Popover from '@mui/material/Popover'
import { CurrencyChip, ChipManagerRow } from '#app/components/CurrencyChip'
import { Currency, CurrencyList } from '#app/types'
import { pipe } from 'fp-ts/function'

export interface CurrenciesHistoryProps {
    list: CurrencyList;
    active: Currency | null;
    select: (currency: Currency) => void;
    align: 'top' | 'bottom';
}

export const CurrenciesHistory: FC<CurrenciesHistoryProps> = ({ list, align, active, select }) => {
    const [chipRef, setChipRef] = useState<null | HTMLElement>(null)
    const [manageCurrency, setManageCurrency] = useState<Currency | null>(null)

    const openManagePanelHandler = useCallback((currency: Currency, target: HTMLElement) => {
        setManageCurrency(currency)
        setChipRef(target)
    }, [])
    const closeManagePanelHandler = useCallback(() => {
        setManageCurrency(null)
        setChipRef(null)
    }, [])

    return (
        <Stack direction="row" spacing={1}>
            <Popover
                open={manageCurrency !== null}
                anchorEl={chipRef}
                onClose={closeManagePanelHandler}
                elevation={0}
                anchorOrigin={{
                    vertical: align,
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: align === 'top' ? 'bottom' : 'top',
                    horizontal: 'center',
                }}
            >
                <ChipManagerRow currency={manageCurrency!}/>
            </Popover>
            {list.map(currency => (
                pipe(
                    active !== null && active.code === currency.code,
                    (isActive) => (
                        <CurrencyChip
                            isActive={isActive}
                            currency={currency}
                            onSelect={select}
                            onLongPress={openManagePanelHandler}
                            key={currency.code}
                        />
                    ),
                )
            ))}
        </Stack>
    )
}
