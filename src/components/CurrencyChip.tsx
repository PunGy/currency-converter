import { FC, forwardRef, memo, useCallback, useRef } from 'react'

import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { grey } from '@mui/material/colors'

import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LockIcon from '@mui/icons-material/Lock'
import UnlockIcon from '@mui/icons-material/LockOpen'

import { Currency, CurrencyList } from '#app/types'
import { ActionTypes, Dispatcher } from '#app/actions'

export interface ChipManagerProps {
    currency: Currency;
    index: number;
    dispatchAction: Dispatcher;
    history: CurrencyList;
    onClose: () => void;
}
export const ChipManagerRow: FC<ChipManagerProps> = forwardRef(({ currency, dispatchAction, index, history, onClose }, ref) => {
    const deleteHandler = useCallback(() => {
        dispatchAction({ type: ActionTypes.REMOVE, payload: index })
        onClose()
    }, [index, dispatchAction])

    const swapHandler = useCallback((indexA: number, indexB: number) => {
        if (indexA < 0 || indexB < 0 || indexA >= history.length || indexB >= history.length) return

        dispatchAction({ type: ActionTypes.SWAP, payload: [indexA, indexB] })
    }, [dispatchAction, index, history])

    const lockHandler = useCallback(() => {
        dispatchAction({ type: ActionTypes.LOCK, payload: index })
        onClose()
    }, [index, dispatchAction, onClose])

    return (
        <Stack direction="row" spacing={1} ref={ref}>
            <IconButton color="error" onClick={deleteHandler}>
                <DeleteIcon/>
            </IconButton>
            <IconButton onClick={() => swapHandler(index, index - 1)}>
                <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={() => swapHandler(index, index + 1)}>
                <ArrowForwardIcon/>
            </IconButton>
            <IconButton onClick={lockHandler}>
                {'locked' in currency ? <UnlockIcon /> : <LockIcon />}
            </IconButton>
        </Stack>
    )
})

export interface CurrencyChipProps {
    isActive: boolean;
    currency: Currency;
    onSelect: (currency: Currency) => void;
    onLongPress: (currency: Currency, target: HTMLElement) => void;
    isLocked: boolean;
}

export const CurrencyChip: FC<CurrencyChipProps> = memo(({ isActive, currency, onSelect, onLongPress, isLocked }) => {
    const timerRef = useRef<any>() // Timer
    const isLongPress = useRef<boolean>() // Long press toggle
    const chipRef = useRef<HTMLDivElement>(null) // Chip ref

    return (
        <Chip
            ref={chipRef}
            sx={{
                backgroundColor: theme => isActive
                    ? theme.palette.primary.light
                    : isLocked
                        ? '#ff748e'
                        : grey[100],
                border: theme => `1px solid ${isActive ? theme.palette.primary.dark : grey[600]}`,
                '&:hover': {
                    backgroundColor: theme => isActive
                        ? theme.palette.primary.light
                        : isLocked
                            ? '#ff97ab'
                            : grey[300],
                },
            }}
            color={isActive ? 'primary' : 'default'}
            label={currency.code.toUpperCase()}
            onMouseDown={() => {
                timerRef.current = setTimeout(() => {
                    isLongPress.current = true
                    onLongPress(currency, chipRef.current!)
                }, 700)
            }}
            onMouseUp={() => {
                clearTimeout(timerRef.current)
                if (isLongPress.current) {
                    isLongPress.current = false
                } else {
                    onSelect(currency)
                }
            }}
            clickable
        />
    )
}, (prevProps, nextProps) => (
    prevProps.isActive === nextProps.isActive && prevProps.currency.code === nextProps.currency.code
))
