import { FC, forwardRef, memo, useRef } from 'react'

import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { grey } from '@mui/material/colors'

import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LockIcon from '@mui/icons-material/Lock'

import { Currency } from '#app/types'

export interface ChipManagerProps {
    currency: Currency;
}
export const ChipManagerRow: FC<ChipManagerProps> = forwardRef(({ currency }, ref) => (
    <Stack direction="row" spacing={1} ref={ref}>
        <IconButton color="error">
            <DeleteIcon />
        </IconButton>
        <IconButton>
            <ArrowBackIcon />
        </IconButton>
        <IconButton>
            <ArrowForwardIcon />
        </IconButton>
        <IconButton>
            <LockIcon />
        </IconButton>
    </Stack>
))

export interface CurrencyChipProps {
    isActive: boolean;
    currency: Currency;
    onSelect: (currency: Currency) => void;
    onLongPress: (currency: Currency, target: HTMLElement) => void;
}

export const CurrencyChip: FC<CurrencyChipProps> = memo(({ isActive, currency, onSelect, onLongPress }) => {
    const timerRef = useRef<any>() // Timer
    const isLongPress = useRef<boolean>() // Long press toggle
    const chipRef = useRef<HTMLDivElement>(null) // Chip ref

    return (
        <Chip
            ref={chipRef}
            sx={{
                backgroundColor: theme => isActive ? theme.palette.primary.light : grey[100],
                border: theme => `1px solid ${isActive ? theme.palette.primary.dark : grey[600]}`,
                '&:hover': {
                    backgroundColor: theme => isActive ? theme.palette.primary.light : grey[300],
                },
            }}
            color={isActive ? 'primary' : 'default'}
            label={currency.code.toUpperCase()}
            onMouseDown={() => {
                timerRef.current = setTimeout(() => {
                    isLongPress.current = true
                    onLongPress(currency, chipRef.current!)
                }, 1000)
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
