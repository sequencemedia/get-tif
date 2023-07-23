import nconf from 'nconf'

const args = nconf.argv().env().get()

export default new Map(Object.entries(args))
