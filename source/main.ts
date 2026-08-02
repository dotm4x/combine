import { Component, Dimension, Vector } from '@stonebogus/combine'
import { effect } from '@preact/signals-core'

const component = new Component()

let updateCount = 0

const disposer = effect(() => {
  const position = component.position.value
  console.log(Vector.toString(position))
  updateCount++
})

component.position.value = Vector.new(Dimension.new(10), Dimension.new(20))
component.size.value = Vector.new(Dimension.new(50), Dimension.new(50))
