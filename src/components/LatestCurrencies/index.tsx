import { Chip, Stack, StackProps } from '@mui/material';
import * as React from 'react'
import { Currency } from '../../types';
import { grey } from '@mui/material/colors';
import { alpha } from '@mui/system'


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
                        backgroundColor: (theme) => isSelected ? alpha(theme.palette.primary.light, 0.4) : grey[100],
                        border: theme => `1px solid ${isSelected ? theme.palette.primary.dark : grey[600]}`,
                        '&:hover': {
                            backgroundColor: (theme) => isSelected ? alpha(theme.palette.primary.light, 0.6) : grey[300]
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