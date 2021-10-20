import * as React from 'react'
import { TextField, TextFieldProps } from '@mui/material'

const CurrencyInput: React.FC<TextFieldProps> = (props) => (
    <TextField sx={{ width: 300 }} type="number" InputLabelProps={{ shrink: true }} {...props} />
)

export default CurrencyInput
