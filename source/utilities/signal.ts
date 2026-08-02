import type { Contractual } from '../interfaces/contractual.ts'
import { Disposable } from '../interfaces/disposable.ts'

export type SignalCallback<Payload extends unknown[] = []> = (
  ...payload: Payload
) => void | Promise<void>

export interface Listener {
  disconnect: () => void
}

export interface OnlyConnectableSignal<Payload extends unknown[] = []> {
  connect(
    callback: (...payload: Payload) => void,
    persistent?: boolean,
  ): Listener
  readonly enabled: boolean
  readonly listeners: ReadonlyMap<SignalCallback<Payload>, boolean>
}

export class Signal<Payload extends unknown[] = []>
  implements Contractual<OnlyConnectableSignal<Payload>>, Disposable {
  public enabled = true

  private _listeners: Map<SignalCallback<Payload>, boolean> = new Map()
  private _disposed = false

  public contract(): OnlyConnectableSignal<Payload> {
    return {
      connect: (callback: SignalCallback<Payload>, persistent = false) =>
        this.connect(callback, persistent),
      enabled: this.enabled,
      listeners: this.listeners,
    }
  }

  get listeners(): ReadonlyMap<SignalCallback<Payload>, boolean> {
    return this._listeners
  }

  get disposed(): boolean {
    return this._disposed
  }

  public connect(
    callback: SignalCallback<Payload>,
    persistent = false,
  ): Listener {
    if (this._disposed) {
      throw new Error('Signal is disabled or disposed, cannot connect')
    }
    this._listeners.set(callback, persistent)
    return {
      disconnect: () => {
        this._listeners.delete(callback)
      },
    }
  }

  public fire(...payload: Payload): void {
    if (this._disposed || !this.enabled) {
      throw new Error('Signal is disposed, cannot fire')
    }
    for (const [callback] of this._listeners) {
      try {
        callback(...payload)
      } catch (error) {
        console.error('Error in signal listener:', error)
        throw error
      }
    }
  }

  public clear(force = false): void {
    if (this._disposed) {
      throw new Error('Signal is disabled or disposed, cannot clear')
    }
    if (force) {
      this._listeners.clear()
    } else {
      for (const [callback, persistent] of this._listeners.entries()) {
        if (!persistent) {
          this._listeners.delete(callback)
        }
      }
    }
  }

  public dispose(): void {
    this._listeners.clear()
    this._disposed = true
  }
}
