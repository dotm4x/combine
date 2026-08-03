import { OnlyConnectableSignal, Signal } from './signal.ts'
import { Destroyable } from '../interfaces/destroyable.ts'

export interface ReadOnlyRegistry<ItemType> {
  readonly registerable: boolean
  readonly removable: boolean
  readonly clearable: boolean
  readonly limit?: number
  readonly onAdded: OnlyConnectableSignal<[ItemType]>
  readonly onRemoved: OnlyConnectableSignal<[ItemType]>
  readonly destroyed: boolean
  has(item: ItemType): boolean
  size(): number
  all(): ItemType[]
  filter(predicate: (item: ItemType) => boolean): ItemType[]
  find(predicate: (item: ItemType) => boolean): ItemType | undefined
}

export class Registry<ItemType> implements Destroyable {
  public readonly registerable: boolean
  public readonly removable: boolean
  public readonly clearable: boolean
  public readonly limit?: number
  private _onAdd: (item: ItemType) => void = () => {}
  private _onRemove: (item: ItemType) => void = () => {}

  private _items: Set<ItemType> = new Set()
  private _destroyed: boolean = false

  private readonly _onAdded: Signal<[ItemType]> = new Signal()
  public readonly onAdded: OnlyConnectableSignal<[ItemType]> = this._onAdded
    .contract()
  private readonly _onRemoved: Signal<[ItemType]> = new Signal()
  public readonly onRemoved: OnlyConnectableSignal<[ItemType]> = this._onRemoved
    .contract()

  public constructor(settings: {
    items?: ItemType[]
    registerable?: boolean
    removable?: boolean
    clearable?: boolean
    limit?: number
    onAdd?: (item: ItemType) => void
    onRemove?: (item: ItemType) => void
  } = {}) {
    this.registerable = settings.registerable ?? true
    this.removable = settings.removable ?? true
    this.clearable = settings.clearable ?? true
    this.limit = settings.limit
    if (settings.onAdd) this._onAdd = settings.onAdd
    if (settings.onRemove) this._onRemove = settings.onRemove
    for (const item of settings.items ?? []) {
      this.register(item)
    }
  }

  public asReadOnly(): ReadOnlyRegistry<ItemType> {
    return {
      registerable: this.registerable,
      removable: this.removable,
      clearable: this.clearable,
      limit: this.limit,
      onAdded: this.onAdded,
      onRemoved: this.onRemoved,
      destroyed: this._destroyed,
      has: (item: ItemType) => this.has(item),
      size: () => this.size(),
      all: () => this.all(),
      filter: (predicate) => this.filter(predicate),
      find: (predicate) => this.find(predicate),
    }
  }

  public get destroyed(): boolean {
    return this._destroyed
  }

  public register(item: ItemType): void {
    if (this.destroyed) {
      throw new Error('Registry is destroyed, cannot register, item')
    }
    if (!this.registerable) {
      throw new Error(
        'Registry is not able to register items, cannot register, item',
      )
    }
    if (this.limit !== undefined && this._items.size >= this.limit) {
      const target = this._items.values().next().value
      if (target !== undefined) {
        this.remove(target)
      }
    }
    if (this._items.has(item)) {
      throw new Error('Item is already registered, cannot register, item')
    }
    this._onAdd(item)
    this._items.add(item)
    this._onAdded.fire(item)
  }

  public remove(item: ItemType): void {
    if (this.destroyed) {
      throw new Error('Registry is destroyed, cannot remove, item')
    }
    if (!this.removable) {
      throw new Error(
        'Registry is not able to remove items, cannot remove item',
      )
    }
    if (!this._items.has(item)) {
      throw new Error(
        'Item is not added or does not exists, cannot remove item',
      )
    }
    this._onRemove(item)
    this._items.delete(item)
    this._onRemoved.fire(item)
  }

  public clear(): void {
    if (this.destroyed) {
      throw new Error('Registry is destroyed, cannot clear')
    }
    if (!this.clearable) {
      throw new Error('Registry is not able to be cleared, cannot clear')
    }
    for (const item of Array.from(this._items)) {
      this.remove(item)
    }
  }

  public has(item: ItemType): boolean {
    return this._items.has(item)
  }

  public size(): number {
    return this._items.size
  }

  public all(): ItemType[] {
    return Array.from(this._items)
  }

  public filter(predicate: (item: ItemType) => boolean): ItemType[] {
    return this.all().filter(predicate)
  }

  public find(predicate: (item: ItemType) => boolean): ItemType | undefined {
    return this.all().find(predicate)
  }

  public destroy(): void {
    if (this._destroyed) {
      throw new Error('Registry is already destroyed, cannot destroy again')
    }

    this._items.clear()

    this._onAdded.destroy()
    this._onRemoved.destroy()

    this._destroyed = true
  }
}
