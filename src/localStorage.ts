import { identity } from 'fp-ts/function'
import { IOEither, tryCatch } from 'fp-ts/IOEither'
import { IOOption } from 'fp-ts/IOOption'
import { fromNullable } from 'fp-ts/Option'

export const get = (key: string): IOOption<string> => () => fromNullable(localStorage.getItem(key))
export const set = <V>(key: string, value: V): IOEither<any, V> => tryCatch<any, V>(
    () => {
        localStorage.setItem(key, JSON.stringify(value))
        return value
    },
    identity,
)
