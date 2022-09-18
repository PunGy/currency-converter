import { TextFieldProps, TextField } from '@mui/material'
import { FC } from 'react'

type CurrencyInputProps = TextFieldProps & {
    onValueChange?: (value: string) => void;
}

export const CurrencyInput: FC<CurrencyInputProps> = ({ onValueChange, ...props }) => (
    <TextField
        InputLabelProps={{ shrink: true }}
        onChange={(event) => onValueChange && onValueChange(event.target.value)}
        sx={{ width: '100%', ...props?.sx }}
        {...props}
    />
)
