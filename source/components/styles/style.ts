import { Destroyable } from '../../interfaces/destroyable.ts'
import { OnlyConnectableSignal, Signal } from '../../utilities/signal.ts'
import { Component } from '../component.ts'

export interface StyleSettings {
  parent?: Component
}

export abstract class Style implements Destroyable {
  private _parent?: Component

  private _applied = false
  private _destroyed = false

  private _onApply: Signal = new Signal()
  public onApply: OnlyConnectableSignal = this._onApply
    .contract()
  private _onRevert: Signal = new Signal()
  public onRevert: OnlyConnectableSignal = this._onRevert
    .contract()
  private _onParentChanged: Signal<[Component | undefined]> = new Signal()
  public onParentChanged: OnlyConnectableSignal<[Component | undefined]> = this
    ._onParentChanged
    .contract()

  public constructor(settings: StyleSettings = {}) {
    this._parent = settings.parent
  }

  public get applied(): boolean {
    return this._applied
  }

  public get destroyed(): boolean {
    return this._destroyed
  }

  public get parent(): Component | undefined {
    return this._parent
  }
  public set parent(value: Component | undefined) {
    if (this._destroyed) {
      throw new Error('Style is destroyed, cannot set parent')
    }

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
    if (this._destroyed) throw new Error('Style is destroyed, cannot revert')

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
    if (this._destroyed) throw new Error('Style is destroyed, cannot revert')

    if (!this._parent) {
      throw new Error('Style has not parent, cannot revert')
    }

    if (!this._applied) {
      throw new Error('Style is not applied, cannot revert')
    }

    this._onRevert.fire()
    this._applied = false
  }

  public destroy(): void {
    if (this._destroyed) {
      throw new Error('Style is already destroyed, cannot destroy again')
    }

    if (this._applied) this.revert()

    this.parent = undefined

    this._onParentChanged.destroy()
    this._onApply.destroy()
    this._onRevert.destroy()

    this._destroyed = true
  }
}
