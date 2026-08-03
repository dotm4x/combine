export class Composer<ElementType = unknown> {
  public readonly root: ElementType

  public constructor(settings: { root: ElementType }) {
    this.root = settings.root
  }

  public compose(): ElementType {
    return this.root
  }
}
