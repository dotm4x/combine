export interface Destroyable {
  get destroyed(): boolean
  destroy(): void
}
