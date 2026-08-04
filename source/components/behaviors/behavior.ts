import { Destroyable } from '../../interfaces/destroyable.ts'
import { OnlyConnectableSignal, Signal } from '../../utilities/signal.ts'
import { Component } from '../component.ts'

export interface BehaviorSettings {
  parent?: Component
}

export abstract class Behavior implements Destroyable {
  private _parent?: Component
  private _attached = false
  private _destroyed = false

  private _onAttach: Signal = new Signal()
  public onAttach: OnlyConnectableSignal = this._onAttach.contract()
  private _onDetach: Signal = new Signal()
  public onDetach: OnlyConnectableSignal = this._onDetach.contract()
  protected _onPropertyChanged: Signal<[string, unknown]> = new Signal()
  public onPropertyChanged: OnlyConnectableSignal<[string, unknown]> = this
    ._onPropertyChanged.contract()
  private _onParentChanged: Signal<[Component | undefined]> = new Signal()
  public onParentChanged: OnlyConnectableSignal<[Component | undefined]> = this
    ._onParentChanged
    .contract()

  public constructor(settings: BehaviorSettings = {}) {
    this._parent = settings.parent
  }

  public get parent(): Component | undefined {
    return this._parent
  }

  public set parent(value: Component | undefined) {
    if (this._destroyed) {
      throw new Error('Behavior is destroyed, cannot set parent')
    }

    if (this._parent === value) return

    const oldParent = this._parent

    if (oldParent && oldParent.behaviors.has(this)) {
      oldParent.behaviors.remove(this)
    }

    this._parent = value

    if (this._parent && !this._parent.behaviors.has(this)) {
      this._parent.behaviors.register(this)
    }
    this._onParentChanged.fire(value)
  }

  public get attached(): boolean {
    return this._attached
  }

  public get destroyed(): boolean {
    return this._destroyed
  }

  public attach(): void {
    if (this._destroyed) throw new Error('Behavior is destroyed, cannot attach')

    if (!this._parent) {
      throw new Error('Behavior has no parent, cannot attach')
    }

    if (this._attached) {
      throw new Error('Behavior is already attached, cannot attach')
    }

    if (!this._parent.element) {
      throw new Error("Behavior's parent has no element, cannot attach")
    }

    this._onAttach.fire()
    this._attached = true
  }

  public detach(): void {
    if (this._destroyed) throw new Error('Behavior is destroyed, cannot detach')

    if (!this._attached) return

    this._onDetach.fire()
    this._attached = false
  }

  public destroy(): void {
    if (this._destroyed) {
      throw new Error('Behavior is already destroyed, cannot destroy again')
    }

    if (this._attached) this.detach()

    this.parent = undefined

    this._onAttach.destroy()
    this._onDetach.destroy()
    this._onPropertyChanged.destroy()
    this._onParentChanged.destroy()

    this._destroyed = true
  }
}
