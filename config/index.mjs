import {
  resolve
} from 'node:path'
import args from './args.mjs'
import {
  DEFAULT_HOST,
  DEFAULT_PORT,
  DEFAULT_DB,
  DEFAULT_DIRECTORY
} from './defaults.mjs'

const {
  env: {
    NODE_ENV = 'development'
  }
} = process

let USERNAME
let PASSWORD
let HOST
let PORT

if (NODE_ENV === 'production') {
  if (!args.has('username')) throw new Error('Parameter `username` is required')
  USERNAME = args.get('username')

  if (!args.has('password')) throw new Error('Parameter `password` is required')
  PASSWORD = args.get('password')

  if (!args.has('host')) throw new Error('Parameter `host` is required')
  HOST = args.get('host')
} else {
  if (NODE_ENV === 'development') {
    HOST = (
      args.has('host')
        ? args.get('host')
        : DEFAULT_HOST
    )

    PORT = (
      args.has('port')
        ? args.get('port')
        : DEFAULT_PORT
    )
  }
}

export {
  USERNAME,
  PASSWORD,
  HOST,
  PORT
}

export const DB = (
  args.has('db')
    ? args.get('db')
    : DEFAULT_DB
)

export const DIRECTORY = (
  resolve(
    args.has('directory')
      ? args.get('directory')
      : DEFAULT_DIRECTORY
  )
)
