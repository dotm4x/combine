import { OnlyConnectableSignal, Signal } from './signal.ts'
import { Disposable } from '../interfaces/disposable.ts'

export interface ReadOnlyRegistry<ItemType> {
  readonly registerable: boolean
  readonly removible: boolean
  readonly clearable: boolean
  readonly limit?: number
  readonly onAdded: OnlyConnectableSignal<[ItemType]>
  readonly onRemoved: OnlyConnectableSignal<[ItemType]>
  readonly disposed: boolean
  has(item: ItemType): boolean
  size(): number
  all(): ItemType[]
  filter(predicate: (item: ItemType) => boolean): ItemType[]
  find(predicate: (item: ItemType) => boolean): ItemType | undefined
}

export class Registry<ItemType> implements Disposable {
  public readonly registerable: boolean
  public readonly removible: boolean
  public readonly clearable: boolean
  public readonly limit?: number
  private _onAdd: (item: ItemType) => void = () => {}
  private _onRemove: (item: ItemType) => void = () => {}

  private _items: Set<ItemType> = new Set()
  private _disposed: boolean = false

  private readonly _onAdded: Signal<[ItemType]> = new Signal()
  public readonly onAdded: OnlyConnectableSignal<[ItemType]> = this._onAdded
    .contract()
  private readonly _onRemoved: Signal<[ItemType]> = new Signal()
  public readonly onRemoved: OnlyConnectableSignal<[ItemType]> = this._onRemoved
    .contract()

  public constructor(settings: {
    items?: ItemType[]
    registerable?: boolean
    removible?: boolean
    clearable?: boolean
    limit?: number
    onAdd?: (item: ItemType) => void
    onRemove?: (item: ItemType) => void
  } = {}) {
    this.registerable = settings.registerable ?? true
    this.removible = settings.removible ?? true
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
      removible: this.removible,
      clearable: this.clearable,
      limit: this.limit,
      onAdded: this.onAdded,
      onRemoved: this.onRemoved,
      disposed: this._disposed,
      has: (item: ItemType) => this.has(item),
      size: () => this.size(),
      all: () => this.all(),
      filter: (predicate) => this.filter(predicate),
      find: (predicate) => this.find(predicate),
    }
  }

  public get disposed(): boolean {
    return this._disposed
  }

  public register(item: ItemType): void {
    if (this.disposed) {
      throw new Error('Registry is disposed, cannot register')
    }
    if (!this.registerable) {
      throw new Error('Registry is not able to register items, cannot register')
    }
    if (this.limit !== undefined && this._items.size >= this.limit) {
      const target = this._items.values().next().value
      if (target !== undefined) {
        this.remove(target)
      }
    }
    if (this._items.has(item)) {
      throw new Error('Item is already registered, cannot register')
    }
    this._onAdd(item)
    this._items.add(item)
    this._onAdded.fire(item)
  }

  public remove(item: ItemType): void {
    if (this.disposed) {
      throw new Error('Registry is disposed, cannot remove')
    }
    if (!this.removible) {
      throw new Error('Registry is not able to remove items, cannot remove')
    }
    if (!this._items.has(item)) {
      throw new Error('Item is not added or does not exists, cannot remove')
    }
    this._onRemove(item)
    this._items.delete(item)
    this._onRemoved.fire(item)
  }

  public clear(): void {
    if (this.disposed) {
      throw new Error('Registry is disposed, cannot clear')
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

  public dispose(): void {
    this._items.clear()
    this._onAdded.dispose()
    this._onRemoved.dispose()
  }
}
