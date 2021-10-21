import React from 'react'
import TextField, { TextFieldProps } from '@mui/material/TextField'

const CurrencyInput: React.FC<TextFieldProps> = React.memo((props) => (
    <TextField sx={{ width: 300 }} type="number" InputLabelProps={{ shrink: true }} {...props} />
))

export default CurrencyInput
