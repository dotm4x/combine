import { Component } from './components/component.ts'
import { Renderer } from './renderer.ts'

export class Application {
  public readonly root: Component
  public readonly renderer: Renderer

  private _mounted = false

  public constructor(settings: {
    root: Component
    renderer: Renderer
  }) {
    this.root = settings.root
    this.root.parent = this as unknown as Component
    this.renderer = settings.renderer
  }

  public get mounted(): boolean {
    return this._mounted
  }

  public mount() {
    if (this._mounted) {
      throw new Error('Application is already mounted, cannot mount again')
    }
    this.renderer.mount(this.root)
    this._mounted = true
  }
}
