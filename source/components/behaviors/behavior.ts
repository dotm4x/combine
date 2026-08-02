import { OnlyConnectableSignal, Signal } from '../../utilities/signal.ts'
import { Component } from '../component.ts'

export interface BehaviorSettings {
  parent?: Component
}

export abstract class Behavior {
  private _parent?: Component

  private _attached = false

  private _onAttach: Signal = new Signal()
  public onAttach: OnlyConnectableSignal = this._onAttach
    .contract()
  private _onDetach: Signal = new Signal()
  public onDetach: OnlyConnectableSignal = this._onDetach
    .contract()
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

  public attach(): void {
    if (!this._parent) {
      throw new Error('Style has not parent, cannot apply')
    }

    if (this._attached) {
      throw new Error('Style is already attached, cannot apply ')
    }

    if (!this._parent.element) {
      throw new Error("Style's parent has not element, cannot apply")
    }

    this._onAttach.fire()
    this._attached = true
  }

  public detach(): void {
    if (!this._parent) {
      throw new Error('Style has not parent, cannot revert')
    }

    if (!this._attached) {
      throw new Error('Style is not attached, cannot revert')
    }

    this._onDetach.fire()
    this._attached = false
  }
}
