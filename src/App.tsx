import * as React from 'react';
import { Container, Box, Paper, Grid } from '@mui/material';
import { getExchangeRateFor, getLatestCurrenciesList, toAmount } from './utils';
import CurrencySelector from './components/CurrencySelector';
import LatestCurrencies from './components/LatestCurrencies'
import ImportExportIcon from '@mui/icons-material/ImportExport';
import type { Currency, ExchangeRate } from './types'
import CurrencyInput from './components/CurrencyInput';

const MAX_LATEST_HISTORY_SIZE = 5

const addCurrencyToList = (newCurrency: Currency) => (currentList: Array<Currency>) => {
  if (!currentList.find((c) => c.code === newCurrency.code)) {
    return [newCurrency].concat(currentList.slice(0, MAX_LATEST_HISTORY_SIZE - 1))
  }
  return currentList
}

type CurrencyInputVal = string | number

type ExchangeProps = {
  input: CurrencyInputVal;
  updateInput: React.Dispatch<React.SetStateAction<CurrencyInputVal>>;
  updateOutput: React.Dispatch<React.SetStateAction<CurrencyInputVal>>;
  inputCurrency: Currency | null;
  outputCurrency: Currency | null;
  exchangeRate: ExchangeRate | undefined;
}
const updateExchange = ({
  input,
  updateInput,
  updateOutput,
  inputCurrency,
  outputCurrency,
  exchangeRate,
}: ExchangeProps) => {
  updateInput(() => input)

  if (inputCurrency != null && outputCurrency != null && exchangeRate != null) {
    const amount = +input
    const output = exchangeRate.currency === inputCurrency.code 
      ? amount * exchangeRate.rate[outputCurrency.code]
      : amount / exchangeRate.rate[inputCurrency.code]
    updateOutput(() => output.toFixed(2))
  }
}

function App() {
  const [currencies, setCurrencies] = React.useState<Array<Currency>>([])

  const [selectedCurrencyTop, setSelectedCurrencyTop] = React.useState<Currency | null>(null)
  const [selectedCurrencyBottom, setSelectedCurrencyBottom] = React.useState<Currency | null>(null)

  const [latestCurrenciesTop, setLatestCurrenciesTop] = React.useState<Array<Currency>>([])
  const [latestCurrenciesBottom, setLatestCurrenciesBottom] = React.useState<Array<Currency>>([])

  const [amountTop, setAmountTop] = React.useState<CurrencyInputVal>('')
  const [amountBottom, setAmountBottom] = React.useState<CurrencyInputVal>('')

  const [exchangeRate, setExchangeRate] = React.useState<ExchangeRate>();

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


  const onChangeAmountTop = React.useCallback((source, rest: Partial<ExchangeProps> = {}) => updateExchange({
    input: typeof source === 'object' ? source.target.value : source,
    inputCurrency: selectedCurrencyTop,
    outputCurrency: selectedCurrencyBottom,
    updateInput: setAmountTop,
    updateOutput: setAmountBottom,
    exchangeRate,
    ...rest
  }), [selectedCurrencyTop, selectedCurrencyBottom, exchangeRate])
  const onChangeAmountBottom = React.useCallback((source, rest: Partial<ExchangeProps> = {}) => updateExchange({
    input: typeof source === 'object' ? source.target.value : source,
    inputCurrency: selectedCurrencyBottom,
    outputCurrency: selectedCurrencyTop,
    updateInput: setAmountBottom,
    updateOutput: setAmountTop,
    exchangeRate,
    ...rest
  }), [selectedCurrencyTop, selectedCurrencyBottom, exchangeRate])

  const onSelectCurrencyTop = React.useCallback((currency: Currency) => {
    setSelectedCurrencyTop(currency)
    setLatestCurrenciesTop(addCurrencyToList(currency))

    getExchangeRateFor(currency.code).then(
      (rate) => {
        setExchangeRate(rate)
        onChangeAmountTop(amountTop, { exchangeRate: rate })
      }
    )
  }, [amountTop])
  const onSelectCurrencyBottom = React.useCallback((currency: Currency) => {
    setSelectedCurrencyBottom(currency)
    setLatestCurrenciesBottom(addCurrencyToList(currency))

    getExchangeRateFor(currency.code).then(
      (rate) => {
        setExchangeRate(rate)
        onChangeAmountTop(amountBottom, { exchangeRate: rate })
      }
    )
  }, [amountBottom])


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
              <CurrencyInput value={amountTop} onChange={onChangeAmountTop} label="Amount" disabled={selectedCurrencyTop == null} />
            </Grid>
          </Grid>

          <Box sx={{ padding: 2, display: 'flex', justifyContent: 'center' }}>
            <ImportExportIcon color="action" fontSize="large" />
          </Box>

          <Grid container direction="column" spacing={2} alignContent="center" sx={{ position: 'relative', paddingBottom: '40px' }}>
            <Grid item>
              <CurrencyInput value={amountBottom} onChange={onChangeAmountBottom} label="Amount" disabled={selectedCurrencyBottom == null} />
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
