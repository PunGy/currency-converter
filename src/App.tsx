import { Container, Grid } from '@mui/material'
import styled from '@emotion/styled'
import { FC } from 'react'

import { CurrencyBox } from './components/CurrencyBox'
import { useListOfCurrencies } from './network/currencies'
import { SwapCurrenciesButton } from './components/SwapCurrenciesButton'

const App: FC = () => {
    const allCurrenciesList = useListOfCurrencies()
    return (
        <Container maxWidth="sm">
            <Grid container direction="column">
                <Grid item>
                    <CurrencyBox value={100} currenciesToSelect={allCurrenciesList} history={[ { code: 'usd', title: 'Dollar' } ]} activeCurrency={{ code: 'usd', title: 'Dollar' }} />
                </Grid>

                <Grid item>
                    <SwapCurrenciesButton />
                </Grid>

                <Grid item>
                    <CurrencyBox reverse value={100} currenciesToSelect={allCurrenciesList} history={[ { code: 'usd', title: 'Dollar' } ]} activeCurrency={{ code: 'usd', title: 'Dollar' }} />
                </Grid>
            </Grid>
        </Container>
    )
}

const CurrenciesContainer = styled.div`
    display: flex;
`

export default App
