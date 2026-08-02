import { Behavior, BehaviorSettings } from '../behaviors/behavior.ts'
import { Dimension } from '../../primitives/dimension.ts'
import { Vector } from '../../primitives/vector.ts'

export type ListDirection = 'start-to-end' | 'end-to-start'

export interface ListSettings extends BehaviorSettings {
  padding?: Dimension
  orientation?: 'vertical' | 'horizontal'
  direction?: ListDirection
}

export class List extends Behavior {
  private _padding: Dimension
  private _orientation: 'vertical' | 'horizontal'
  private _direction: ListDirection

  public constructor(settings: ListSettings) {
    super(settings)
    this._padding = settings.padding ?? Dimension.new(0, 0)
    this._orientation = settings.orientation ?? 'vertical'
    this._direction = settings.direction ?? 'start-to-end'

    this.onAttach.connect(() => {
      if (this.parent) {
        this.parent.parts.onAdded.connect(() => this.update())
        this.parent.parts.onRemoved.connect(() => this.update())
        this.update()
      }
    })
  }

  public get padding(): Dimension {
    return this._padding
  }
  public set padding(value: Dimension) {
    if (this._padding === value) return
    this._padding = value
    this._onPropertyChanged.fire('padding', value)
    this.update()
  }

  public get orientation(): 'vertical' | 'horizontal' {
    return this._orientation
  }
  public set orientation(value: 'vertical' | 'horizontal') {
    if (this._orientation === value) return
    this._orientation = value
    this._onPropertyChanged.fire('orientation', value)
    this.update()
  }

  public get direction(): ListDirection {
    return this._direction
  }
  public set direction(value: ListDirection) {
    if (this._direction === value) return
    this._direction = value
    this._onPropertyChanged.fire('direction', value)
    this.update()
  }

  private update() {
    if (!this.parent) return

    const children = Array.from(this.parent.parts.all()).filter((c) =>
      c.visible.state
    )

    let totalNeeded = Dimension.new(0, 0)
    const paddingDim = this._padding

    for (const child of children) {
      const childSize = (this._orientation === 'vertical')
        ? child.size.y
        : child.size.x
      totalNeeded = Dimension.add(totalNeeded, childSize)
      totalNeeded = Dimension.add(totalNeeded, paddingDim)
    }

    totalNeeded = Dimension.subtract(totalNeeded, paddingDim)

    let currentDim = Dimension.new(0, 0)

    if (this._direction === 'end-to-start') {
      const parentSize = (this._orientation === 'vertical')
        ? this.parent.size.y
        : this.parent.size.x
      currentDim = Dimension.subtract(parentSize, totalNeeded)
    }

    for (const child of children) {
      const childSize = (this._orientation === 'vertical')
        ? child.size.y
        : child.size.x

      if (this._orientation === 'vertical') {
        child.position = Vector.new(
          Dimension.new(0, 0),
          currentDim,
        )
      } else {
        child.position = Vector.new(
          currentDim,
          Dimension.new(0, 0),
        )
      }

      currentDim = Dimension.add(currentDim, childSize)
      currentDim = Dimension.add(currentDim, paddingDim)
    }
  }
}
