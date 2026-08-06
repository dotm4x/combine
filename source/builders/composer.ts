import { Component } from '../components/component.ts'

export abstract class Composer {
  public readonly root: Component

  public constructor(settings: { root: Component }) {
    this.root = settings.root
  }

  public abstract compose(): void
}
