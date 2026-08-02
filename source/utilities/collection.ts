import { OnlyConnectableSignal, Signal } from './signal.ts'
import { Identifiable } from '../interfaces/identifiable.ts'
import { Disposable } from '../interfaces/disposable.ts'

export interface ReadOnlyCollection<Type> {
  readonly insertable: boolean
  readonly removible: boolean
  readonly clearable: boolean
  readonly onAdded: OnlyConnectableSignal<[Type]>
  readonly onRemoved: OnlyConnectableSignal<[Type]>
  readonly disposed: boolean
  get(id: string): Type | undefined
  has(id: string): boolean
  size(): number
  all(): Type[]
  filter(predicate: (item: Type) => boolean): Type[]
  find(predicate: (item: Type) => boolean): Type | undefined
}

export class Collection<ItemType extends Identifiable> implements Disposable {
  public readonly insertable: boolean
  public readonly removible: boolean
  public readonly clearable: boolean
  private _onAdd: (item: ItemType) => void = () => {}
  private _onRemove: (item: ItemType) => void = () => {}

  private _items: Map<string, ItemType> = new Map()
  private _disposed: boolean = false

  private readonly _onAdded: Signal<[ItemType]> = new Signal()
  public readonly onAdded: OnlyConnectableSignal<[ItemType]> = this._onAdded
    .contract()
  private readonly _onRemoved: Signal<[ItemType]> = new Signal()
  public readonly onRemoved: OnlyConnectableSignal<[ItemType]> = this._onRemoved
    .contract()

  public constructor(settings: {
    items?: ItemType[]
    insertable?: boolean
    removible?: boolean
    clearable?: boolean
    onAdd?: (item: ItemType) => void
    onRemove?: (item: ItemType) => void
  } = {}) {
    this.insertable = settings.insertable ?? true
    this.removible = settings.removible ?? true
    this.clearable = settings.clearable ?? true
    if (settings.onAdd) this._onAdd = settings.onAdd
    if (settings.onRemove) this._onRemove = settings.onRemove
    for (const item of settings.items ?? []) {
      this.insert(item)
    }
  }

  public asReadOnly(): ReadOnlyCollection<ItemType> {
    return {
      insertable: this.insertable,
      removible: this.removible,
      clearable: this.clearable,
      onAdded: this.onAdded,
      onRemoved: this.onRemoved,
      disposed: this._disposed,
      get: (id: string) => this.get(id),
      has: (id: string) => this.has(id),
      size: () => this.size(),
      all: () => this.all(),
      filter: (predicate) => this.filter(predicate),
      find: (predicate) => this.find(predicate),
    }
  }

  public get disposed(): boolean {
    return this._disposed
  }

  public insert(item: ItemType): void {
    if (this.disposed) {
      throw new Error('Collection is disposed, cannot insert')
    }
    if (!this.insertable) {
      throw new Error('Collection is not able to insert items, cannot insert')
    }
    if (this._items.has(item.id)) {
      throw new Error(
        `Item with id ${item.id} is already inserted, cannot insert`,
      )
    }
    this._onAdd(item)
    this._items.set(item.id, item)
    this._onAdded.fire(item)
  }

  public remove(item: ItemType): void {
    if (this.disposed) {
      throw new Error('Collection is disposed, cannot remove')
    }
    if (!this.removible) {
      throw new Error('Collection is not able to remove items, cannot remove')
    }
    if (!this._items.has(item.id)) {
      throw new Error(
        `Item with id ${item.id} is not inserted or doesn't exist, cannot remove`,
      )
    }
    this._onRemove(item)
    this._items.delete(item.id)
    this._onRemoved.fire(item)
  }

  public clear(): void {
    if (this.disposed) {
      throw new Error('Collection is disposed, cannot clear')
    }
    if (!this.clearable) {
      throw new Error('Collection is not able to be cleared, cannot clear')
    }
    for (const item of this._items.values()) {
      this.remove(item)
    }
  }

  public get(id: string): ItemType | undefined {
    return this._items.get(id)
  }

  public has(id: string): boolean {
    return this._items.has(id)
  }

  public size(): number {
    return this._items.size
  }

  public all(): ItemType[] {
    return Array.from(this._items.values())
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
    this._disposed = true
  }
}
