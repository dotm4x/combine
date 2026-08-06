import { Color } from '../../primitives/color.ts'
import { Style, StyleSettings } from './style.ts'

export interface BackgroundSettings extends StyleSettings {
  color: Color
}

export class Background extends Style {
  private _color: Color

  public constructor(settings: BackgroundSettings) {
    super(settings)
    this._color = settings.color

    this.onApply.connect((node) => {
      node.setStyle('backgroundColor', Color.toRgbString(this._color))
    })

    this.onRevert.connect(() => {
      const node = this.parent!.element!
      node.setStyle('backgroundColor', '')
    })
  }

  public get color(): Color {
    return this._color
  }

  public set color(value: Color) {
    this._color = value
    if (this.applied && this.parent?.element) {
      this.parent.element.setStyle(
        'backgroundColor',
        Color.toRgbString(this._color),
      )
    }
  }
}
