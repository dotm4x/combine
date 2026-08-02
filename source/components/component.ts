import { Identifiable } from '../interfaces/identifiable.ts'
import { Registry } from '../utilities/registry.ts'
import { OnlyConnectableSignal, Signal } from '../utilities/signal.ts'
import { Toggle } from '../utilities/toggle.ts'
import { Behavior } from './behaviors/behavior.ts'
import { Style } from './styles/style.ts'
import { Vector } from '../primitives/vector.ts'
import { Dimension } from '../primitives/dimension.ts'
import { Application } from '../application.ts'
import { Rotation } from '../primitives/rotation.ts'
import { Point } from '../primitives/point.ts'
import { Store } from '../utilities/store.ts'

export interface ComponentSettings {
  parent?: Component
  visible?: boolean
  position?: Vector
  rotation?: Rotation
  size?: Vector
  ratio?: number
  anchor?: Point
  index?: number
  tags?: string[]
  parts?: Component[]
  styles?: Style[]
  behaviors?: Behavior[]
}

export class Component implements Identifiable {
  public readonly id = crypto.randomUUID()
  private _parent?: Component | Application
  public readonly visible: Toggle
  public readonly position: Store<Vector>
  public readonly rotation: Store<Rotation>
  public readonly size: Store<Vector>
  public readonly ratio: Store<number>
  public readonly anchor: Store<Point>
  public readonly index: Store<number>

  public readonly tags: Set<string> = new Set()

  private _loaded = false
  private _element: HTMLElement | undefined
  public parts: Registry<Component> = new Registry({
    onAdd: (component) => {
      if (component.parent !== this) component.parent = this
    },
    onRemove: (component) => {
      if (component.parent === this) component.parent = undefined
    },
  })

  public styles: Registry<Style> = new Registry({
    onAdd: (style) => {
      style.parent = this
    },
    onRemove: (style) => {
      style.revert()
      style.parent = undefined
    },
  })

  public behaviors: Registry<Behavior> = new Registry({
    onAdd: (behavior) => {
      behavior.parent = this
    },
    onRemove: (behavior) => {
      behavior.detach()
      behavior.parent = undefined
    },
  })

  private _onParentChanged: Signal<[Component | Application | undefined]> =
    new Signal()
  public onParentChanged: OnlyConnectableSignal<
    [Component | Application | undefined]
  > = this
    ._onParentChanged
    .contract()
  private _onLoad: Signal = new Signal()
  public onLoad: OnlyConnectableSignal = this._onLoad.contract()

  public constructor(settings: ComponentSettings = {}) {
    this.parent = settings.parent
    this.visible = new Toggle(settings.visible ?? true)
    this.position = new Store(
      settings.position ?? Vector.new(Dimension.new(), Dimension.new()),
      Vector.equals,
    )
    this.rotation = new Store(
      settings.rotation ?? Rotation.new(0),
      Rotation.equals,
    )
    this.size = new Store(
      settings.size ?? Vector.new(Dimension.new(), Dimension.new()),
      Vector.equals,
    )
    this.ratio = new Store(settings.ratio ?? 0)
    this.anchor = new Store(
      settings.anchor ?? Point.new(0.5, 0.5),
      Point.equals,
    )
    this.index = new Store(settings.index ?? 0)

    for (const tag of settings.tags ?? []) {
      this.tags.add(tag)
    }

    for (const component of settings.parts ?? []) {
      this.parts.register(component)
    }

    for (const style of settings.styles ?? []) {
      this.styles.register(style)
    }

    for (const behavior of settings.behaviors ?? []) {
      this.behaviors.register(behavior)
    }

    if (this._parent instanceof Component) {
      this._parent.parts.register(this)
    }
  }

  public get parent(): Component | Application | undefined {
    return this._parent
  }

  public set parent(value: Component | undefined) {
    if (this._parent === value) return

    const oldParent = this._parent
    this._parent = value

    if (oldParent instanceof Component && oldParent.parts.has(this)) {
      oldParent.parts.remove(this)
    }

    this._onParentChanged.fire(value)
  }

  public get loaded(): boolean {
    return this._loaded
  }

  public get element(): HTMLElement | undefined {
    return this._element
  }

  public set element(value: HTMLElement) {
    if (this._element === value) return
    this._element = value
  }

  public load(): void {
    if (this._loaded) {
      throw new Error(
        `Component with id ${this.id} is already loaded, cannot load`,
      )
    }

    if (!this.element) {
      throw new Error(
        `Component with id ${this.id} has no element assigned, cannot load`,
      )
    }

    for (const behavior of this.behaviors.all()) {
      behavior.attach()
    }

    for (const style of this.styles.all()) {
      style.apply()
    }

    for (const part of this.parts.all()) {
      part.load()
    }

    this._loaded = true
    this._onLoad.fire()
  }
}
