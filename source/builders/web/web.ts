import { Composer } from '../composer.ts'
import { Component, ComponentNode } from '../../components/component.ts'
import { StoreListener } from '../../utilities/store.ts'
import * as CSS from 'csstype'

export class DomComponentNode implements ComponentNode {
  public readonly element: HTMLElement
  public parent?: ComponentNode

  constructor(element: HTMLElement = document.createElement('div')) {
    this.element = element
    this.element.style.position = 'absolute'
    this.element.style.boxSizing = 'border-box'
    this.element.style.containerType = 'size'
  }

  public add(node: ComponentNode): void {
    if (node instanceof DomComponentNode) {
      this.element.appendChild(node.element)
      node.parent = this
    }
  }

  public remove(node: ComponentNode): void {
    if (node instanceof DomComponentNode) {
      if (node.element.parentNode === this.element) {
        this.element.removeChild(node.element)
      }
      node.parent = undefined
    }
  }

  public setStyle<K extends keyof CSS.Properties>(
    property: K,
    value: CSS.Properties[K],
  ): void {
    ;(this.element.style as unknown as Record<string, unknown>)[
      property as string
    ] = value ?? ''
  }
}

export class WebComposer extends Composer {
  private _container: HTMLElement
  private _listeners: Map<Component, StoreListener[]> = new Map()
  private _resizeHandler: () => void

  public constructor(settings: { root: Component; container: HTMLElement }) {
    super(settings)
    this._container = settings.container
    this._container.style.position = 'relative'
    this._container.style.overflow = 'hidden'
    this._container.style.containerType = 'size'

    this._resizeHandler = () => {
      this._updateLayoutRecursive(this.root)
    }
    globalThis.addEventListener('resize', this._resizeHandler)
  }

  public compose(): void {
    let rootNode = this.root.element as DomComponentNode
    if (!rootNode) {
      rootNode = new DomComponentNode()
      this.root.element = rootNode
    }

    this._container.appendChild(rootNode.element)
    this._renderComponentRecursive(this.root)
  }

  public unmount(): void {
    globalThis.removeEventListener('resize', this._resizeHandler)

    if (this.root.element && 'element' in this.root.element) {
      const domNode = this.root.element as DomComponentNode
      if (domNode.element.parentNode === this._container) {
        this._container.removeChild(domNode.element)
      }
    }

    for (const [, listeners] of this._listeners) {
      for (const listener of listeners) {
        listener.disconnect()
      }
    }
    this._listeners.clear()
  }

  private _renderComponentRecursive(
    component: Component,
    parentNode?: ComponentNode,
  ): void {
    let node = component.element as DomComponentNode
    if (!node) {
      node = new DomComponentNode()
      component.element = node
    }

    if (parentNode) {
      parentNode.add(node)
    }

    component.build()

    this._updateElementStyles(component, node)

    for (const style of component.styles.all()) {
      if (!style.applied) {
        style.apply(node)
      }
    }

    for (const behavior of component.behaviors.all()) {
      if (!(behavior as any).attached) {
        ;(behavior as any).attach()
      }
    }

    const listeners: StoreListener[] = [
      component.position.connect(() =>
        this._updateElementStyles(component, node)
      ),
      component.size.connect(() => this._updateElementStyles(component, node)),
      component.rotation.connect(() =>
        this._updateElementStyles(component, node)
      ),
      component.anchor.connect(() =>
        this._updateElementStyles(component, node)
      ),
      component.ratio.connect(() => this._updateElementStyles(component, node)),
      component.index.connect(() => this._updateElementStyles(component, node)),
      component.enabled.connect((isEnabled) => {
        node.setStyle('display', isEnabled ? '' : 'none')
      }),
    ]

    this._listeners.set(component, listeners)

    const unsubscribeAdd = component.parts.onAdded.connect(
      (child: Component) => {
        this._renderComponentRecursive(child, node)
      },
    )

    const unsubscribeRemove = component.parts.onRemoved.connect(
      (child: Component) => {
        if (child.element) {
          node.remove(child.element)
          this._cleanupComponentRecursive(child)
        }
      },
    )

    const unsubscribeStyleAdd = component.styles.onAdded.connect(
      (style) => {
        if (!style.applied) {
          style.apply(node)
        }
      },
    )

    const unsubscribeBehaviorAdd = component.behaviors.onAdded.connect(
      (behavior) => {
        if (!(behavior as any).attached) {
          ;(behavior as any).attach()
        }
      },
    )

    listeners.push(
      unsubscribeAdd as unknown as StoreListener,
      unsubscribeRemove as unknown as StoreListener,
      unsubscribeStyleAdd as unknown as StoreListener,
      unsubscribeBehaviorAdd as unknown as StoreListener,
    )

    for (const child of component.parts.all()) {
      this._renderComponentRecursive(child, node)
    }
  }

  private _cleanupComponentRecursive(component: Component): void {
    const listeners = this._listeners.get(component)
    if (listeners) {
      for (const listener of listeners) {
        listener.disconnect()
      }
      this._listeners.delete(component)
    }

    for (const child of component.parts.all()) {
      this._cleanupComponentRecursive(child)
    }
  }

  private _updateLayoutRecursive(component: Component): void {
    if (component.element) {
      this._updateElementStyles(
        component,
        component.element as DomComponentNode,
      )
    }
    for (const child of component.parts.all()) {
      this._updateLayoutRecursive(child)
    }
  }

  private _updateElementStyles(
    component: Component,
    node: DomComponentNode,
  ): void {
    const isEnabled = component.enabled.value
    node.setStyle('display', isEnabled ? '' : 'none')

    const size = component.size.value
    const ratio = component.ratio.value
    const position = component.position.value
    const anchor = component.anchor.value
    const rotation = component.rotation.value
    const index = component.index.value

    if (ratio > 0) {
      const wCQ = `calc(${size.x.scale * 100}cqw + ${size.x.offset}px)`
      const hCQ = `calc(${size.y.scale * 100}cqh + ${size.y.offset}px)`

      node.setStyle('aspectRatio', `${ratio}`)
      node.setStyle('width', `min(${wCQ}, calc(${hCQ} * ${ratio}))`)
      node.setStyle('height', `min(${hCQ}, calc(${wCQ} / ${ratio}))`)
    } else {
      const w = `calc(${size.x.scale * 100}% + ${size.x.offset}px)`
      const h = `calc(${size.y.scale * 100}% + ${size.y.offset}px)`

      node.setStyle('aspectRatio', 'auto')
      node.setStyle('width', w)
      node.setStyle('height', h)
    }

    node.setStyle(
      'left',
      `calc(${position.x.scale * 100}% + ${position.x.offset}px)`,
    )
    node.setStyle(
      'top',
      `calc(${position.y.scale * 100}% + ${position.y.offset}px)`,
    )
    node.setStyle('zIndex', `${index}`)

    node.setStyle('transformOrigin', `${anchor.x * 100}% ${anchor.y * 100}%`)
    node.setStyle(
      'transform',
      `translate(${anchor.x * -100}%, ${
        anchor.y * -100
      }%) rotate(${rotation.degrees}deg)`,
    )
  }
}
