import { OnlyConnectableSignal, Signal } from './signal.ts'

export interface ReadOnlyToggle {
  get state(): boolean
  onStateChanged: OnlyConnectableSignal
  flip(): void
}

export class Toggle {
  private _state: boolean

  private _onStateChanged: Signal = new Signal()
  public onStateChanged: OnlyConnectableSignal = this._onStateChanged.contract()

  public constructor(state: boolean = true) {
    this._state = state
  }

  public asReadOnly(): ReadOnlyToggle {
    const toggle = this
    return {
      onStateChanged: this.onStateChanged,
      get state() {
        return toggle.state
      },
      flip: () => this.flip(),
    }
  }

  public get state(): boolean {
    return this._state
  }

  public set state(value: boolean) {
    if (value === this.state) return
    this._state = value
    this._onStateChanged.fire()
  }

  public flip(): void {
    this.state = !this._state
  }
}
