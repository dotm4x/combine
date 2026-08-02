export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export const Rect = {
  new(settings: { x: number; y: number; width: number; height: number }): Rect {
    return {
      x: settings.x,
      y: settings.y,
      width: settings.width,
      height: settings.height,
    }
  },

  contains(rect: Rect, point: { x: number; y: number }): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    )
  },

  add(a: Rect, b: Rect): Rect {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      width: a.width + b.width,
      height: a.height + b.height,
    }
  },

  subtract(a: Rect, b: Rect): Rect {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      width: a.width - b.width,
      height: a.height - b.height,
    }
  },

  multiply(a: Rect, scalar: number): Rect {
    return {
      x: a.x * scalar,
      y: a.y * scalar,
      width: a.width * scalar,
      height: a.height * scalar,
    }
  },

  divide(a: Rect, scalar: number): Rect {
    return {
      x: a.x / scalar,
      y: a.y / scalar,
      width: a.width / scalar,
      height: a.height / scalar,
    }
  },

  equals(a: Rect, b: Rect): boolean {
    return (
      a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
    )
  },
}
