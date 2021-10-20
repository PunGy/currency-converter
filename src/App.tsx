import * as React from 'react';
import { Container, Box, Paper, Grid } from '@mui/material';
import { getLatestCurrenciesList, toAmount } from './utils';
import CurrencySelector from './components/CurrencySelector';
import LatestCurrencies from './components/LatestCurrencies'
import ImportExportIcon from '@mui/icons-material/ImportExport';
import type { Currency } from './types'
import CurrencyInput from './components/CurrencyInput';

function App() {
  const [currencies, setCurrencies] = React.useState<Array<Currency>>([])

  const [selectedCurrencyTop, setSelectedCurrencyTop] = React.useState<Currency | null>(null)
  const [selectedCurrencyBottom, setSelectedCurrencyBottom] = React.useState<Currency | null>(null)

  const [latestCurrenciesTop, setLatestCurrenciesTop] = React.useState<Array<Currency>>([])
  const [latestCurrenciesBottom, setLatestCurrenciesBottom] = React.useState<Array<Currency>>([])

  const [amountTop, setAmountTop] = React.useState<number | null>()
  const [amountBottom, setAmountBottom] = React.useState<number | null>()

  const addCurrencyToList = React.useCallback((newCurrency: Currency) => (currentList: Array<Currency>) => {
    if (!currentList.find((c) => c.code === newCurrency.code)) {
      return [newCurrency].concat(currentList)
    }
    return currentList
  }, [])

  const onSelectCurrencyTop = React.useCallback((currency: Currency) => {
    setSelectedCurrencyTop(currency)
    setLatestCurrenciesTop(addCurrencyToList(currency))
  }, [])
  const onSelectCurrencyBottom = React.useCallback((currency: Currency) => {
    setSelectedCurrencyBottom(currency)
    setLatestCurrenciesBottom(addCurrencyToList(currency))
  }, [])

  React.useEffect(() => {
    getLatestCurrenciesList().then(setCurrencies).catch(console.log)

    const latestTop = localStorage.getItem('latest-currencies-top')
    const latestBottom = localStorage.getItem('latest-currencies-bottom')
    if (latestTop != null) {
      setLatestCurrenciesTop(JSON.parse(latestTop))
    }
    if (latestBottom != null) {
      setLatestCurrenciesBottom(JSON.parse(latestBottom))
    }
  }, [])


  const onChangeAmountTop = React.useCallback(event => {
    const amount = toAmount(event.target.value)
    setAmountTop(() => amount)


  }, [])
  const onChangeAmountBottom = React.useCallback(event => setAmountBottom(() => toAmount(event.target.value)), [])


  return (
    <Container sx={{ height: '100vh' }}>
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ width: '100%', padding: 2 }}>
          <Grid container direction="column" spacing={2} alignContent="center" sx={{ position: 'relative', paddingTop: '40px' }}>
            <Grid item>
              <LatestCurrencies sx={{ position: 'absolute', top: 10 }} selected={selectedCurrencyTop} list={latestCurrenciesTop} onSelectCurrency={onSelectCurrencyTop} />
              <CurrencySelector value={selectedCurrencyTop} onSelect={onSelectCurrencyTop} label="Select currency" currencies={currencies} />
            </Grid>
            <Grid item>
              <CurrencyInput value={amountTop} onChange={onChangeAmountTop} label="Amount" />
            </Grid>
          </Grid>

          <Box sx={{ padding: 2, display: 'flex', justifyContent: 'center' }}>
            <ImportExportIcon color="action" fontSize="large" />
          </Box>

          <Grid container direction="column" spacing={2} alignContent="center" sx={{ position: 'relative', paddingBottom: '40px' }}>
            <Grid item>
              <CurrencyInput value={amountBottom} onChange={onChangeAmountBottom} label="Amount" />
            </Grid>
            <Grid item>
              <CurrencySelector value={selectedCurrencyBottom} onSelect={onSelectCurrencyBottom} label="Select currency" currencies={currencies} />
              <LatestCurrencies sx={{ position: 'absolute', bottom: 0 }} selected={selectedCurrencyBottom} list={latestCurrenciesBottom} onSelectCurrency={onSelectCurrencyBottom} />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}

export default App
