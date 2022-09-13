import { TextFieldProps, TextField } from '@mui/material'
import { FC } from 'react'

export const CurrencyInput: FC<TextFieldProps> = (props) => (
    <TextField InputLabelProps={{ shrink: true }} sx={{ width: '100%', ...props?.sx }} {...props} />
)
