import { Identifiable } from '../interfaces/identifiable.ts'
import { Registry } from '../utilities/registry.ts'
import { OnlyConnectableSignal, Signal } from '../utilities/signal.ts'
import { Vector } from '../primitives/vector.ts'
import { Dimension } from '../primitives/dimension.ts'
import { Rotation } from '../primitives/rotation.ts'
import { Point } from '../primitives/point.ts'
import { Store } from '../utilities/store.ts'
import { Style } from './styles/index.ts'
import { Behavior } from './behaviors/behavior.ts'
import { Collection } from '../utilities/collection.ts'
import { Destroyable } from '../interfaces/destroyable.ts'

export interface ComponentSettings<ElementType = unknown> {
  parent?: Component<ElementType>
  id?: string
  enabled?: boolean
  position?: Vector
  rotation?: Rotation
  size?: Vector
  ratio?: number
  anchor?: Point
  index?: number
  tags?: string[]
  behaviors?: Behavior<ElementType>[]
  styles?: Style<ElementType>[]
}

export abstract class Component<ElementType = unknown>
  implements Identifiable, Destroyable {
  private _parent?: Component<ElementType>
  public readonly id: string
  public readonly enabled: Store<boolean>
  public readonly position: Store<Vector>
  public readonly rotation: Store<Rotation>
  public readonly size: Store<Vector>
  public readonly ratio: Store<number>
  public readonly anchor: Store<Point>
  public readonly index: Store<number>

  public readonly tags: Set<string> = new Set()

  private _built = false
  private _element: ElementType | undefined
  private _destroyed = false

  public parts: Collection<Component<ElementType>> = new Collection({
    onAdd: (component) => {
      if (component.parent !== this) component.parent = this
    },
    onRemove: (component) => {
      if (component.parent === this) component.parent = undefined
    },
  })

  public behaviors: Registry<Behavior<ElementType>> = new Registry({
    onAdd: (behavior) => {
      behavior.parent = this
    },
    onRemove: (behavior) => {
      behavior.detach()
      behavior.parent = undefined
    },
  })

  public styles: Registry<Style<ElementType>> = new Registry({
    onAdd: (style) => {
      style.parent = this
    },
    onRemove: (style) => {
      style.revert()
      style.parent = undefined
    },
  })

  private _onParentChanged: Signal<
    [Component<ElementType> | undefined]
  > = new Signal()
  public onParentChanged: OnlyConnectableSignal<
    [Component<ElementType> | undefined]
  > = this
    ._onParentChanged
    .contract()
  private _onBuild: Signal = new Signal()
  public onBuild: OnlyConnectableSignal = this._onBuild.contract()

  public constructor(settings: ComponentSettings<ElementType> = {}) {
    this.parent = settings.parent
    this.id = settings.id ?? crypto.randomUUID()
    this.enabled = new Store(settings.enabled ?? true)
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

    for (const behavior of settings.behaviors ?? []) {
      this.behaviors.register(behavior)
    }

    for (const style of settings.styles ?? []) {
      this.styles.register(style)
    }

    if (this._parent instanceof Component) {
      this._parent.parts.insert(this)
    }
  }

  public get parent(): Component<ElementType> | undefined {
    return this._parent
  }

  public set parent(value: Component<ElementType> | undefined) {
    if (this._parent === value) return

    const oldParent = this._parent
    this._parent = value

    if (oldParent instanceof Component && oldParent.parts.has(this.id)) {
      oldParent.parts.remove(this)
    }

    this._onParentChanged.fire(value)
  }

  public get built(): boolean {
    return this._built
  }

  public get element(): ElementType | undefined {
    return this._element
  }

  public set element(value: ElementType) {
    if (this._element === value) return
    this._element = value
  }

  public get destroyed(): boolean {
    return this._destroyed
  }

  public abstract compose(): Generator<Component<ElementType>, void, unknown>

  public build(): void {
    if (this._built) {
      throw new Error(
        `Component with id ${this.id} is already built, cannot build`,
      )
    }

    for (const part of this.compose()) {
      this.parts.insert(part)
    }

    for (const behavior of this.behaviors.all()) {
      behavior.attach()
    }

    for (const style of this.styles.all()) {
      style.apply()
    }

    for (const part of this.parts.all()) {
      part.build()
    }

    this._onBuild.fire()
    this._built = true
  }

  public dump(
    depth: number = 0,
    last: boolean = true,
    prefix: string = '',
    maxDepth: number = Infinity,
  ): void {
    const colors = {
      reset: '\x1b[0m',
      dim: '\x1b[2m',
      blue: '\x1b[34m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
    }

    const connector = last ? '└── ' : '├── '
    const newPrefix = prefix + (last ? '    ' : '│   ')

    const id = `${colors.dim}(id: ${this.id.slice(0, 8)})${colors.reset}`
    const tag = this.tags.size > 0
      ? ` ${colors.yellow}[${Array.from(this.tags).join(', ')}]${colors.reset}`
      : ''
    const color = this.constructor.name === 'Panel' ? colors.blue : colors.green

    console.log(
      `${prefix}${
        depth === 0 ? '' : connector
      }${color}${this.constructor.name}${colors.reset}${id}${tag}`,
    )

    if (depth >= maxDepth) {
      if (this.parts.size() > 0) {
        console.log(
          `${newPrefix}${colors.dim}... (max depth reached)${colors.reset}`,
        )
      }
      return
    }

    const parts = this.parts.all()

    if (parts.length === 0) {
      console.log(`${newPrefix}${colors.dim}(no parts)${colors.reset}`)
    } else {
      parts.forEach((part, index) => {
        const isLastPart = index === parts.length - 1
        part.dump(depth + 1, isLastPart, newPrefix, maxDepth)
      })
    }
  }

  public destroy(): void {
    if (this._destroyed) {
      throw new Error(
        `Component with id "${this.id}" is already destroyed, cannot destroy again`,
      )
    }

    this.enabled.value = false

    for (const part of this.parts.all()) {
      part.destroy()
    }
    this.parts.destroy()

    for (const behavior of this.behaviors.all()) {
      behavior.destroy()
    }
    this.behaviors.destroy()

    for (const style of this.styles.all()) {
      style.destroy()
    }
    this.styles.destroy()

    this.enabled.destroy()
    this.position.destroy()
    this.rotation.destroy()
    this.size.destroy()
    this.ratio.destroy()
    this.anchor.destroy()
    this.index.destroy()

    this._element = undefined

    this._onParentChanged.destroy()
    this._onBuild.destroy()

    this._destroyed = true
  }
}
