import { OnlyConnectableSignal, Signal } from '../../utilities/signal.ts'
import { Component } from '../component.ts'

export interface StyleSettings {
  parent?: Component
}

export abstract class Style<
  SettingsType extends StyleSettings = Record<PropertyKey, never>,
> {
  private _parent?: Component

  private _applied = false

  private _onApply: Signal = new Signal()
  public onApply: OnlyConnectableSignal = this._onApply
    .contract()
  private _onRevert: Signal = new Signal()
  public onRevert: OnlyConnectableSignal = this._onRevert
    .contract()
  protected _onPropertyChanged: Signal<[string, unknown]> = new Signal()
  public onPropertyChanged: OnlyConnectableSignal<[string, unknown]> = this
    ._onPropertyChanged.contract()
  private _onParentChanged: Signal<[Component | undefined]> = new Signal()
  public onParentChanged: OnlyConnectableSignal<[Component | undefined]> = this
    ._onParentChanged
    .contract()

  public constructor(settings: SettingsType = {} as SettingsType) {
    this._parent = settings.parent
  }

  public get parent(): Component | undefined {
    return this._parent
  }
  public set parent(value: Component | undefined) {
    if (this._parent === value) return

    const oldParent = this._parent

    if (oldParent && oldParent.styles.has(this)) {
      oldParent.styles.remove(this)
    }

    this._parent = value

    if (this._parent && !this._parent.styles.has(this)) {
      this._parent.styles.register(this)
    }
    this._onParentChanged.fire(value)
  }

  public apply(): void {
    if (!this._parent) {
      throw new Error('Style has not parent, cannot apply')
    }

    if (this._applied) {
      throw new Error('Style is already applied, cannot apply ')
    }

    if (!this._parent.element) {
      throw new Error("Style's parent has not element, cannot apply")
    }

    this._onApply.fire()
    this._applied = true
  }

  public revert(): void {
    if (!this._parent) {
      throw new Error('Style has not parent, cannot revert')
    }

    if (!this._applied) {
      throw new Error('Style is not applied, cannot revert')
    }

    this._onRevert.fire()
    this._applied = false
  }
}
