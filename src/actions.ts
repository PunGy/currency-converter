import { Currency, CurrencyList, LockedCurrency, UnlockedCurrency } from '#app/types'
import { pipe } from 'fp-ts/function'
import { findIndex } from 'fp-ts/Array'
import { fold as foldO } from 'fp-ts/Option'
import { Observable, scan, startWith } from 'rxjs'
import { saveHistory } from '#app/localStorage'

// I need to redeclare this function
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { deleteAt } from 'fp-ts/Record'

export const MAX_HISTORY_LENGTH = 5

export enum ActionTypes {
    SELECT = 'SELECT',
    REMOVE = 'REMOVE',
    LOCK = 'LOCK',
    UNLOCK = 'UNLOCK',
    SWAP = 'SWAP',
}
export type ActionPayload = {
    [ActionTypes.SELECT]: Currency;
    [ActionTypes.REMOVE]: number;
    [ActionTypes.LOCK]: number;
    [ActionTypes.UNLOCK]: number;
    [ActionTypes.SWAP]: [number, number];
}
export type Action<T extends ActionTypes = ActionTypes> = {
    type: T;
    payload: ActionPayload[T];
}

type Handlers<S, T extends ActionTypes = ActionTypes> = {
    [K in T]: (history: S, payload: ActionPayload[K]) => S
}

// Default function does not return appropriate object type
declare function deleteAt<K extends string>(
    key: K,
): <O extends object>(r: O) => ({
    [K2 in Exclude<keyof O, K>]: O[K2]
})

const splitOnUnlockedAndLocked = (history: CurrencyList) => history
    .reduce<[Array<UnlockedCurrency>, Array<LockedCurrency>]>((acc, currency) => {
        if ('locked' in currency) {
            acc[1].push(currency)
        } else {
            acc[0].push(currency)
        }
        return acc
    }, [[], []])

const unlockCurrency = deleteAt('locked')
export const historyHandlers: Handlers<CurrencyList> = {
    [ActionTypes.SELECT]: (history: CurrencyList, payload: ActionPayload[ActionTypes.SELECT]) => pipe(
        history,
        findIndex((currency) => currency.code === payload.code),
        foldO(
            () => {
                const [withoutLocked, locked] = splitOnUnlockedAndLocked(history)
                withoutLocked.unshift(payload)
                locked.forEach((currency) => {
                    withoutLocked.splice(currency.locked, 0, currency)
                })
                // Renaming it because we've added locked currencies to the array
                const newHistory = withoutLocked

                return newHistory.length > MAX_HISTORY_LENGTH
                    ? newHistory.slice(0, -1)
                    : newHistory
            },
            () => history,
        ),
    ),
    [ActionTypes.REMOVE]: (history: CurrencyList, position: ActionPayload[ActionTypes.REMOVE]) => {
        const [withoutLocked, locked] = splitOnUnlockedAndLocked(
            history.filter((_, i) => i !== position),
        )
        locked.forEach((currency) => {
            withoutLocked.splice(currency.locked, 0, unlockCurrency(currency))
        })
        return withoutLocked
    },
    [ActionTypes.LOCK]: (history: CurrencyList, position: ActionPayload[ActionTypes.LOCK]) => (
        history.map((currency, i) => i === position ? { ...currency, locked: i } : currency)
    ),
    [ActionTypes.UNLOCK]: (history: CurrencyList, position: ActionPayload[ActionTypes.UNLOCK]) => (
        history.map((currency, i) => i === position ? unlockCurrency(currency) : currency)
    ),
    [ActionTypes.SWAP]: (history: CurrencyList, payload: ActionPayload[ActionTypes.SWAP]) => {
        const [indexA, indexB] = payload
        if (
            (history[indexA] === undefined || history[indexB] === undefined)
            || (indexA === indexB)
        ) {
            return history
        }

        const newHistory = [...history]

        const currencyA = newHistory[indexA]!
        if ('locked' in currencyA) {
            currencyA.locked = indexB
        }
        const currencyB = newHistory[indexB]!
        if ('locked' in currencyB) {
            currencyB.locked = indexA
        }

        // There is a bug in the Typescript https://github.com/microsoft/TypeScript/issues/52623
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        [newHistory[indexA], newHistory[indexB]] = [newHistory[indexB], newHistory[indexA]]

        /* eslint-enable @typescript-eslint/ban-ts-comment */
        return newHistory
    },
}
const callHandler = <S, T extends ActionTypes>(handlers: Handlers<S, T>, state: S, action: Action<T>) => (
    action.type in handlers
        ? handlers[action.type](state, action.payload)
        : state
)

export const watchHistory = (action$: Observable<Action>, cacheKey: string, initialHistory: CurrencyList = []) => action$
    .pipe(
        scan<Action, CurrencyList>((history, action) => (
            saveHistory(
                callHandler(historyHandlers, history, action),
                cacheKey,
            )
        ),
        initialHistory),
    )

type CurrencyActionTypes = ActionTypes.SELECT | ActionTypes.REMOVE
const currencyHandlers: Handlers<Currency | null, CurrencyActionTypes> = {
    [ActionTypes.SELECT]: (currency: Currency | null, payload: ActionPayload[ActionTypes.SELECT]) => payload,
    [ActionTypes.REMOVE]: () => null,
}

export const watchCurrency = (action$: Observable<Action>, cachedCurrency: Currency | null) => (
    action$.pipe(
        scan<Action, Currency | null>((currency, action) => (
            // TODO: Remove this assertion when the issue is fixed
            callHandler(currencyHandlers, currency, action as Action<CurrencyActionTypes>)
        ), cachedCurrency),
    ).pipe(startWith(cachedCurrency))
)

export type Dispatcher = <T extends ActionTypes>(action: Action<T>) => void

export const selectCurrency = (dispatcher: Dispatcher) => (currency: Currency) => (
    dispatcher({
        type: ActionTypes.SELECT,
        payload: currency,
    })
)
