import { Component } from './components/component.ts'

export class Renderer {
  public readonly element: HTMLElement
  private _root: Component | null = null

  public constructor(settings: { element: HTMLElement }) {
    this.element = settings.element

    this.element.style.position = 'relative'
    this.element.style.overflow = 'hidden'

    globalThis.addEventListener('resize', () => {
      if (this._root) {
        this._updateLayoutRecursive(this._root)
      }
    })
  }

  public mount(root: Component) {
    this._root = root
    this._renderComponent(root, this.element)

    if (!root.loaded) {
      root.load()
    }
  }

  private _updateLayoutRecursive(component: Component) {
    if (component.element) {
      this._updateElementStyles(component, component.element)
    }
    for (const child of component.parts.all()) {
      this._updateLayoutRecursive(child)
    }
  }

  private _renderComponent(
    component: Component,
    parent: HTMLElement,
  ) {
    let element = component.element
    if (!element) {
      element = document.createElement('div')
      component.element = element
    }

    element.style.position = 'absolute'
    element.style.boxSizing = 'border-box'

    this._updateElementStyles(component, element)

    component.onPropertyChanged.connect((propertyName) => {
      if (
        ['position', 'size', 'rotation', 'anchor', 'visible', 'ratio'].includes(
          propertyName,
        )
      ) {
        this._updateElementStyles(component, element as HTMLElement)
      }
    })

    parent.appendChild(element)

    for (const child of component.parts.all()) {
      this._renderComponent(child, element)
    }
  }

  private _updateElementStyles(
    component: Component,
    element: HTMLElement,
  ) {
    const isVisible = component.visible.state
    element.style.display = isVisible ? 'block' : 'none'

    const size = component.size
    element.style.width = `calc(${size.x.scale * 100}% + ${size.x.offset}px)`

    if (component.ratio > 0) {
      element.style.aspectRatio = `${component.ratio}`
      element.style.height = 'auto'
    } else {
      element.style.aspectRatio = 'auto'
      element.style.height = `calc(${size.y.scale * 100}% + ${size.y.offset}px)`
    }

    const position = component.position
    element.style.left = `calc(${
      position.x.scale * 100
    }% + ${position.x.offset}px)`
    element.style.top = `calc(${
      position.y.scale * 100
    }% + ${position.y.offset}px)`

    const anchor = component.anchor
    const rotation = component.rotation
    const rotationValue = rotation.degrees

    element.style.transformOrigin = `${anchor.x * 100}% ${anchor.y * 100}%`

    element.style.transform = `translate(${anchor.x * -100}%, ${
      anchor.y * -100
    }%) rotate(${rotationValue}deg)`
  }
}
