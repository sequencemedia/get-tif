export default {
  filePath: {
    type: String,
    required: true,
    index: true
  },
  directory: {
    type: String,
    required: true,
    index: true
  },
  hash: {
    type: String,
    required: true,
    index: true
  },
  added: {
    type: Date,
    required: true
  },
  removed: {
    type: Boolean,
    required: true,
    default: false
  }
}
