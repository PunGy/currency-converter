import { FC, useCallback, useState } from 'react'
import Stack from '@mui/material/Stack'
import Popover from '@mui/material/Popover'
import { CurrencyChip, ChipManagerRow } from '#app/components/CurrencyChip'
import { Currency, CurrencyList } from '#app/types'
import { pipe } from 'fp-ts/function'
import { Dispatcher, selectCurrency } from '#app/actions'

export interface CurrenciesHistoryProps {
    list: CurrencyList;
    active: Currency | null;
    align: 'top' | 'bottom';
    dispatchAction: Dispatcher;
}

export const CurrenciesHistory: FC<CurrenciesHistoryProps> = ({
    list,
    align,
    active,
    dispatchAction,
}) => {
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
                {manageCurrency && (
                    <ChipManagerRow
                        dispatchAction={dispatchAction}
                        currency={manageCurrency}
                        index={list.findIndex((c) => c.code === manageCurrency.code)}
                        history={list}
                        onClose={closeManagePanelHandler}
                    />
                )}
            </Popover>
            {list.map((currency) => (
                pipe(
                    [active !== null && active.code === currency.code, 'locked' in currency] as const,
                    ([isActive, isLocked]) => (
                        <CurrencyChip
                            isActive={isActive}
                            isLocked={isLocked}
                            currency={currency}
                            onSelect={selectCurrency(dispatchAction)}
                            onLongPress={openManagePanelHandler}
                            key={currency.code}
                        />
                    ),
                )
            ))}
        </Stack>
    )
}
