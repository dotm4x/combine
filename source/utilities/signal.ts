import type { Contractual } from '../interfaces/contractual.ts'
import { Destroyable } from '../interfaces/destroyable.ts'

export interface SignalListener {
  disconnect: () => void
  readonly persistent: boolean
}

export interface OnlyConnectableSignal<Payload extends unknown[] = []> {
  connect(
    callback: (...payload: Payload) => void,
    persistent?: boolean,
  ): SignalListener
}

export class Signal<Payload extends unknown[] = []>
  implements Contractual<OnlyConnectableSignal<Payload>>, Destroyable {
  private _listeners: Set<
    SignalListener & { callback: (...payload: Payload) => void }
  > = new Set()
  private _destroyed = false

  public contract(): OnlyConnectableSignal<Payload> {
    return {
      connect: (callback, persistent) => this.connect(callback, persistent),
    }
  }

  public get destroyed(): boolean {
    return this._destroyed
  }

  public connect(
    callback: (...payload: Payload) => void,
    persistent = false,
  ): SignalListener {
    if (this._destroyed) {
      throw new Error('Signal is destroyed, cannot connect')
    }

    const listener: SignalListener & {
      callback: (...payload: Payload) => void
    } = {
      callback,
      disconnect: () => {
        this._listeners.delete(listener)
      },
      persistent,
    }

    this._listeners.add(listener)
    return listener
  }

  public fire(...payload: Payload): void {
    if (this._destroyed) {
      throw new Error('Signal is destroyed, cannot fire')
    }

    for (const listener of this._listeners) {
      try {
        listener.callback(...payload)
      } catch (error) {
        console.error('Error in signal listener:', error)
        throw error
      }
    }
  }

  public clear(force = false): void {
    if (this._destroyed) {
      throw new Error('Signal is destroyed, cannot clear')
    }

    for (const listener of this._listeners) {
      if (force || !listener.persistent) {
        listener.disconnect()
      }
    }
  }

  public destroy(): void {
    if (this._destroyed) {
      throw new Error('Signal is already destroyed, cannot destroy again')
    }

    this._listeners.clear()

    this._destroyed = true
  }
}
