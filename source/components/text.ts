import { Component, ComponentSettings } from './component.ts'

export interface TextSettings extends ComponentSettings {
  content?: string
}

export class Text extends Component {
  private _content: string

  public constructor(settings: TextSettings) {
    super(settings)
    this._content = settings.content ?? 'No content'

    this.onLoad.connect(() => {
      if (this.element) {
        this.element.textContent = this._content
      }
    })
  }

  public get content(): string {
    return this._content
  }

  public set content(value: string) {
    if (this._content == value) return
    this._content = value
    if (this.element) {
      this.element.textContent = value
    }
    this._onPropertyChanged.fire('content', value)
  }
}
