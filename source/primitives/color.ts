const clamp = (number: number) => Math.min(255, Math.max(0, Math.round(number)))

export interface Color {
  red: number
  blue: number
  green: number
}

export const Color = {
  new(settings: {
    hex?: string
    red?: number
    green?: number
    blue?: number
  }): Color {
    if (settings.hex) {
      const cleanHex = settings.hex.replace('#', '')
      return {
        red: parseInt(cleanHex.substring(0, 2), 16) || 0,
        green: parseInt(cleanHex.substring(2, 4), 16) || 0,
        blue: parseInt(cleanHex.substring(4, 6), 16) || 0,
      }
    }

    return {
      red: settings.red ?? 0,
      green: settings.green ?? 0,
      blue: settings.blue ?? 0,
    }
  },

  random(): Color {
    const randomByte = () => Math.floor(Math.random() * 256)
    return {
      red: randomByte(),
      green: randomByte(),
      blue: randomByte(),
    }
  },

  toHex(color: Color): string {
    const toHexPart = (n: number) =>
      Math.min(Math.max(n, 0), 255).toString(16).padStart(2, '0')
    return `#${toHexPart(color.red)}${toHexPart(color.green)}${
      toHexPart(color.blue)
    }`
  },

  toRgbString(color: Color): string {
    return `rgb(${color.red}, ${color.green}, ${color.blue})`
  },

  lerp(a: Color, b: Color, factor: number): Color {
    return {
      red: a.red + (b.red - a.red) * factor,
      green: a.green + (b.green - a.green) * factor,
      blue: a.blue + (b.blue - a.blue) * factor,
    }
  },

  invert(color: Color): Color {
    return {
      red: 255 - color.red,
      green: 255 - color.green,
      blue: 255 - color.blue,
    }
  },

  add(a: Color, b: Color): Color {
    return {
      red: clamp(a.red + b.red),
      green: clamp(a.green + b.green),
      blue: clamp(a.blue + b.blue),
    }
  },

  subtract(a: Color, b: Color): Color {
    return {
      red: clamp(a.red - b.red),
      green: clamp(a.green - b.green),
      blue: clamp(a.blue - b.blue),
    }
  },

  multiply(a: Color, scalar: number): Color {
    return {
      red: clamp(a.red * scalar),
      green: clamp(a.green * scalar),
      blue: clamp(a.blue * scalar),
    }
  },

  divide(a: Color, scalar: number): Color {
    return {
      red: clamp(a.red / scalar),
      green: clamp(a.green / scalar),
      blue: clamp(a.blue / scalar),
    }
  },

  equals(a: Color, b: Color): boolean {
    return a.red === b.red && a.green === b.green && a.blue === b.blue
  },

  toString(color: Color): string {
    return `Color(r: ${color.red}, g: ${color.green}, b: ${color.blue})`
  },
}
