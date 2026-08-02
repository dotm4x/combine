export interface Dimension {
  scale: number
  offset: number
}

export const Dimension = {
  new(scale: number = 0, offset: number = 0): Dimension {
    return {
      scale: scale,
      offset: offset,
    }
  },

  calculate(dimension: Dimension, factor: number): number {
    return factor + dimension.offset
  },

  add(a: Dimension, b: Dimension): Dimension {
    return {
      scale: a.scale + b.scale,
      offset: a.offset + b.offset,
    }
  },

  subtract(a: Dimension, b: Dimension): Dimension {
    return {
      scale: a.scale - b.scale,
      offset: a.offset - b.offset,
    }
  },

  multiply(a: Dimension, scalar: number): Dimension {
    return {
      scale: a.scale * scalar,
      offset: a.offset * scalar,
    }
  },

  divide(a: Dimension, scalar: number): Dimension {
    return {
      scale: a.scale / scalar,
      offset: a.offset / scalar,
    }
  },

  equals(a: Dimension, b: Dimension): boolean {
    return a.scale === b.scale && a.offset === b.offset
  },
}
