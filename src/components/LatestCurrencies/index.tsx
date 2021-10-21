import React from 'react'

import Chip from '@mui/material/Chip'
import Stack, { StackProps } from '@mui/material/Stack'
import { grey } from '@mui/material/colors';

import { Currency } from '../../types';


export interface LatestCurrenciesProps extends StackProps {
    list: Array<Currency>;
    selected: Currency | null;
    onSelectCurrency: (currency: Currency) => void;
}


const LatestCurrencies: React.FC<LatestCurrenciesProps> = ({ list, selected, onSelectCurrency, ...props }) => (
    <Stack direction="row" spacing={1} {...props}>
        {list.map(currency => {
            const isSelected = selected !== null && currency.code === selected.code
            return (
                <Chip 
                    sx={{
                        backgroundColor: (theme) => isSelected ? theme.palette.primary.light : grey[100],
                        border: theme => `1px solid ${isSelected ? theme.palette.primary.dark : grey[600]}`,
                        '&:hover': {
                            backgroundColor: (theme) => isSelected ? theme.palette.primary.light : grey[300]
                        }
                    }}
                    color={isSelected ? 'primary' : 'default'}
                    label={currency.code.toUpperCase()} 
                    onClick={() => onSelectCurrency(currency)}
                    clickable 
                    key={currency.code} 
                />
            )
        })}
    </Stack>
)

export default LatestCurrencies