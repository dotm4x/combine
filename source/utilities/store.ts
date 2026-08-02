import {
  type ReadonlySignal,
  type Signal,
  signal as createSignal,
} from '@preact/signals-core'

export class Store<ValueType> {
  private _signal: Signal<ValueType>
  private _equals?: (a: ValueType, b: ValueType) => boolean

  public constructor(
    initial: ValueType,
    equals?: (a: ValueType, b: ValueType) => boolean,
  ) {
    this._signal = createSignal(initial)
    this._equals = equals
  }

  public get value(): ValueType {
    return this._signal.value
  }

  public set value(newValue: ValueType) {
    const same = this._equals
      ? this._equals(this._signal.value, newValue)
      : this._signal.value === newValue

    if (same) return

    this._signal.value = newValue
  }

  public get asReadOnly(): ReadonlySignal<ValueType> {
    return this._signal
  }
}
