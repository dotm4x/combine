import { Color } from '../../primitives/color.ts'
import { Style, StyleSettings } from './style.ts'

export interface BackgroundSettings extends StyleSettings {
  color: Color
}

export class Background extends Style<BackgroundSettings> {
  private _color: Color

  public constructor(settings: BackgroundSettings) {
    super(settings)
    this._color = settings.color

    this.onApply.connect(() => {
      const element = this.parent!.element!
      element.style.backgroundColor = Color.toRgbString(this._color)
    })

    this.onRevert.connect(() => {
      const element = this.parent!.element!
      element.style.backgroundColor = ''
    })
  }

  public get color(): Color {
    return this._color
  }
}
