import { Dimension } from './dimension.ts'

export interface Vector {
  x: Dimension
  y: Dimension
}

export const Vector = {
  new(x: Dimension, y: Dimension): Vector {
    return { x, y }
  },

  add(a: Vector, b: Vector): Vector {
    return {
      x: Dimension.add(a.x, b.x),
      y: Dimension.add(a.y, b.y),
    }
  },

  subtract(a: Vector, b: Vector): Vector {
    return {
      x: Dimension.subtract(a.x, b.x),
      y: Dimension.subtract(a.y, b.y),
    }
  },

  multiply(a: Vector, scalar: number): Vector {
    return {
      x: Dimension.multiply(a.x, scalar),
      y: Dimension.multiply(a.y, scalar),
    }
  },

  divide(a: Vector, scalar: number): Vector {
    return {
      x: Dimension.divide(a.x, scalar),
      y: Dimension.divide(a.y, scalar),
    }
  },

  equals(a: Vector, b: Vector): boolean {
    return Dimension.equals(a.x, b.x) && Dimension.equals(a.y, b.y)
  },

  toString(vector: Vector): string {
    return `Vector(x: ${Dimension.toString(vector.x)}, y: ${
      Dimension.toString(vector.y)
    })`
  },
}
