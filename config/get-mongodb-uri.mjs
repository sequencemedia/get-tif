import {
  USERNAME,
  PASSWORD,
  HOST,
  PORT,
  DB
} from './index.mjs'

const {
  env: {
    NODE_ENV = 'development'
  }
} = process

export default function getMongoDBUri () {
  if (NODE_ENV === 'production') {
    return `mongodb+srv://${USERNAME}:${PASSWORD}@${HOST}/${DB}`
  } else {
    if (NODE_ENV === 'development') {
      return `mongodb://${HOST}:${PORT}/${DB}`
    }
  }

  throw new Error('Parameter `NODE_ENV` is invalid')
}
