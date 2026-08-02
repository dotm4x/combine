const normalize = (degrees: number) => ((degrees % 360) + 360) % 360

export interface Rotation {
  degrees: number
}

export const Rotation = {
  new(degrees: number): Rotation {
    return {
      degrees: normalize(degrees),
    }
  },

  add(a: Rotation, b: Rotation): Rotation {
    return {
      degrees: normalize(a.degrees + b.degrees),
    }
  },

  subtract(a: Rotation, b: Rotation): Rotation {
    return {
      degrees: normalize(a.degrees - b.degrees),
    }
  },

  multiply(a: Rotation, scalar: number): Rotation {
    return {
      degrees: normalize(a.degrees * scalar),
    }
  },

  divide(a: Rotation, scalar: number): Rotation {
    return {
      degrees: normalize(a.degrees / scalar),
    }
  },

  equals(a: Rotation, b: Rotation): boolean {
    return a.degrees === b.degrees
  },

  toString(rotation: Rotation): string {
    return `Rotation(${rotation.degrees}°)`
  },
}
