import debug from 'debug'
import mongoose from 'mongoose'
import express from 'express'
import Joi from 'joi'
import http from 'node:http'
import path from 'node:path'
import {
  access,
  constants
} from 'node:fs/promises'
import sharp from 'sharp'
import getTifModel from './models/tif.mjs'
import getMongoDBUri from './config/get-mongodb-uri.mjs'

const {
  env: {
    PORT = 3001
  }
} = process

async function connect () {
  const {
    readyState = DISCONNECTED
  } = connection

  if (readyState < CONNECTED) await mongoose.connect(getMongoDBUri())
}

async function disconnect () {
  const {
    readyState = DISCONNECTED
  } = connection

  if (
    readyState === CONNECTED ||
    readyState === CONNECTING
  ) await mongoose.disconnect()
}

const log = debug('@sequencemedia/get-tif/server')
const info = debug('@sequencemedia/get-tif/server:info')
const warn = debug('@sequencemedia/get-tif/server:warn')
const error = debug('@sequencemedia/get-tif/server:error')
const app = express()
const server = http.createServer(app)

const tifModel = getTifModel()

const DISCONNECTED = 0
const CONNECTED = 1
const CONNECTING = 2

/*
 *  const DISCONNECTED = 0
 *  const CONNECTED = 1
 *  const CONNECTING = 2
 *  const DISCONNECTING = 3
 */

const {
  connection = {}
} = mongoose

connection
  .on('open', () => {
    info('open')
  })
  .on('connected', () => {
    info('connected')
  })
  .on('connecting', () => {
    info('connecting')
  })
  .on('reconnected', () => {
    warn('reconnected')
  })
  .on('error', ({ message }) => {
    error(`errror - "${message}"`)
  })
  .on('disconnected', () => {
    warn('disconnected')
  })

process
  .on('SIGHUP', async (signal) => {
    const {
      stdout
    } = process

    if ('clearLine' in stdout) {
      stdout.clearLine()
      stdout.cursorTo(0)
    }

    log(signal)

    await disconnect()

    process.exit(0)
  })
  .on('SIGINT', async (signal) => {
    const {
      stdout
    } = process

    if ('clearLine' in stdout) {
      stdout.clearLine()
      stdout.cursorTo(0)
    }

    log(signal)

    await disconnect()

    process.exit(0)
  })
  .on('SIGBREAK', async (signal) => {
    log(signal)

    await disconnect()

    process.exit(0)
  })
  .on('SIGQUIT', async (signal) => {
    log(signal)

    await disconnect()

    process.exit(0)
  })
  .on('SIGTERM', async (signal) => {
    log(signal)

    await disconnect()

    process.exit(0)
  })
  .on('SIGPIPE', async (signal) => {
    log(signal)

    await disconnect()
  })
  .on('beforeExit', async (code) => {
    log('beforeExit', code)

    await disconnect()
  })
  .on('exit', async (code) => {
    log('exit', code)

    await disconnect()
  })
  .on('uncaughtException', async ({ message }) => {
    log('uncaughtException', message)

    await disconnect()

    process.exit(1)
  })
  .on('unhandledRejection', async (reason, promise) => {
    log('unhandledRejection', reason, promise)

    await disconnect()

    process.exit(1)
  })

const ID = /[0-9a-fA-F]{24}/

function toAbsolutePath ({
  directory,
  filePath
}) {
  return path.join(directory, filePath)
}

function toMessage ({ message }) {
  return { message }
}

{
  const schema = Joi.object().keys({
    id: (
      Joi.string()
        .min(24)
        .max(24)
        .regex(ID)
        .required()
    ),
    type: (
      Joi.string()
        .lowercase()
        .valid('jpg', 'png')
        .required()
    )
  })

  function validate ({ params }, res, next) {
    const {
      error
    } = schema.validate(params)

    if (error) {
      const {
        details
      } = error

      if (details.length > 1) {
        res.status(422)
          .json({ messages: details.map(toMessage) })
      } else {
        const [
          detail
        ] = details

        res.status(422)
          .json(toMessage(detail))
      }
    } else {
      next()
    }
  }

  app
    .get('/:id/:type', validate, async ({ params: { id, type } }, res) => {
      const model = await tifModel.findOne({ _id: id, removed: { $ne: true } })
      if (model) {
        const fileName = `${id}.${type}`
        const filePath = `.cache/${fileName}`

        try {
          await access(filePath, constants.R_OK)
        } catch {
          await sharp(toAbsolutePath(model)).toFile(filePath)
        }

        return res.download(filePath, fileName, { root: '.' })
      }

      res.status(404).end()
    })
}

{
  const schema = Joi.object().keys({
    id: (
      Joi.string()
        .min(24)
        .max(24)
        .regex(ID)
        .required()
    )
  })

  function validate ({ params }, res, next) {
    const {
      error
    } = schema.validate(params)

    if (error) {
      const {
        details
      } = error

      if (details.length > 1) {
        res.status(422)
          .json({ messages: details.map(toMessage) })
      } else {
        const [
          detail
        ] = details

        res.status(422)
          .json(toMessage(detail))
      }
    } else {
      next()
    }
  }

  app
    .get('/:id', validate, async ({ params: { id } }, res) => {
      const model = await tifModel.findOne({ _id: id, removed: { $ne: true } })
      if (model) return res.download(toAbsolutePath(model), id + '.tif')

      res.status(404).end()
    })
}

function start () {
  return (
    new Promise((resolve, reject) => {
      try {
        server.listen(PORT, async () => {
          info(PORT)

          resolve()
        })
      } catch (e) {
        reject(e)
      }
    })
  )
}

connect()
  .then(start)
  .catch(error)
