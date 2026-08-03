import { OnlyConnectableSignal, Signal } from '../../utilities/signal.ts'
import { Component } from '../component.ts'

export interface BehaviorSettings<ElementType = unknown> {
  parent?: Component<ElementType>
}

export abstract class Behavior<ElementType = unknown> {
  private _parent?: Component<ElementType>

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
  private _onParentChanged: Signal<[Component<ElementType> | undefined]> =
    new Signal()
  public onParentChanged: OnlyConnectableSignal<
    [Component<ElementType> | undefined]
  > = this
    ._onParentChanged
    .contract()

  public constructor(settings: BehaviorSettings<ElementType> = {}) {
    this._parent = settings.parent
  }

  public get parent(): Component<ElementType> | undefined {
    return this._parent
  }
  public set parent(value: Component<ElementType> | undefined) {
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
      throw new Error('Behavior has not parent, cannot apply')
    }

    if (this._attached) {
      throw new Error('Behavior is already attached, cannot apply ')
    }

    if (!this._parent.element) {
      throw new Error("Behavior's parent has not element, cannot apply")
    }

    this._onAttach.fire()
    this._attached = true
  }

  public detach(): void {
    if (!this._parent) {
      throw new Error('Behavior has not parent, cannot revert')
    }

    if (!this._attached) {
      throw new Error('Behavior is not attached, cannot revert')
    }

    this._onDetach.fire()
    this._attached = false
  }
}
