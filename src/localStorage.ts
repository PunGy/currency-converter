import { identity } from 'fp-ts/lib/function'
import { IOEither, tryCatch } from 'fp-ts/lib/IOEither'
import { IOOption } from 'fp-ts/lib/IOOption'
import { fromNullable } from 'fp-ts/lib/Option'

export const get = (key: string): IOOption<string> => () => fromNullable(localStorage.getItem(key))
export const set = <V>(key: string, value: V): IOEither<any, V> => tryCatch<any, V>(
    () => {
        localStorage.setItem(key, JSON.stringify(value))
        return value
    },
    identity,
)
