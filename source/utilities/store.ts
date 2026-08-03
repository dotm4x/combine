import {
  effect,
  type Signal,
  signal as createSignal,
} from '@preact/signals-core'
import type { Contractual } from '../interfaces/contractual.ts'
import { Destroyable } from '../interfaces/destroyable.ts'

export interface StoreListener {
  disconnect: () => void
  readonly persistent: boolean
}

export interface OnlyConnectableStore<ValueType> {
  connect(
    callback: (value: ValueType) => void,
    persistent?: boolean,
  ): StoreListener
  readonly value: ValueType
}

export class Store<ValueType>
  implements Contractual<OnlyConnectableStore<ValueType>>, Destroyable {
  private _signal: Signal<ValueType>
  private _equals?: (a: ValueType, b: ValueType) => boolean
  private _listeners: Set<
    StoreListener & { callback: (value: ValueType) => void }
  > = new Set()
  private _destroyed = false

  public constructor(
    initial: ValueType,
    equals?: (a: ValueType, b: ValueType) => boolean,
  ) {
    this._signal = createSignal(initial)
    this._equals = equals
  }

  public contract(): OnlyConnectableStore<ValueType> {
    const store = this
    return {
      connect: (callback, persistent) => store.connect(callback, persistent),
      get value() {
        return store._signal.value
      },
    }
  }

  public get value(): ValueType {
    if (this._destroyed) throw new Error('Store is destroyed, cannot get value')
    return this._signal.value
  }

  public set value(newValue: ValueType) {
    if (this._destroyed) {
      throw new Error('Store is destroyed, cannot set value')
    }

    const same = this._equals
      ? this._equals(this._signal.value, newValue)
      : this._signal.value === newValue

    if (same) return

    this._signal.value = newValue
  }

  public get destroyed(): boolean {
    return this._destroyed
  }

  public connect(
    callback: (value: ValueType) => void,
    persistent = false,
  ): StoreListener {
    if (this._destroyed) {
      throw new Error('Store is destroyed, cannot connect')
    }

    const dispose = effect(() => {
      callback(this._signal.value)
    })

    const listener: StoreListener & { callback: (value: ValueType) => void } = {
      callback,
      disconnect: () => {
        dispose()
        this._listeners.delete(listener)
      },
      persistent,
    }

    this._listeners.add(listener)
    return listener
  }

  public clear(force = false): void {
    if (this._destroyed) {
      throw new Error('Store is destroyed, cannot clear')
    }

    for (const listener of this._listeners) {
      if (force || !listener.persistent) {
        listener.disconnect()
      }
    }
  }

  public destroy(): void {
    if (this._destroyed) {
      throw new Error('Store is already destroyed, cannot destroy again')
    }

    for (const listener of this._listeners) {
      listener.disconnect()
    }

    this._listeners.clear()

    this._destroyed = true
  }
}
