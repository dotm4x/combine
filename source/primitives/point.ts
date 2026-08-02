export interface Point {
  x: number
  y: number
}

export const Point = {
  new(x: number, y: number): Point {
    return {
      x: x,
      y: y,
    }
  },

  add(a: Point, b: Point): Point {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    }
  },

  subtract(a: Point, b: Point): Point {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
    }
  },

  multiply(a: Point, scalar: number): Point {
    return {
      x: a.x * scalar,
      y: a.y * scalar,
    }
  },

  divide(a: Point, scalar: number): Point {
    return {
      x: a.x / scalar,
      y: a.y / scalar,
    }
  },

  equals(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y
  },

  toString(point: Point): string {
    return `Point(x: ${point.x}, y: ${point.y})`
  },
}
