import mongoose from 'mongoose'
import schema from '#model-schemas/tif'

let MODEL

const config = {
  collection: 'tifs',
  versionKey: false
}

export default function getTifModel () {
  if (MODEL) return MODEL
  const modelSchema = new mongoose.Schema(schema, config)

  MODEL = mongoose.model('Tif', modelSchema)

  return MODEL
}
