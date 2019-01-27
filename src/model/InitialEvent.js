const Event = require('./Event')

class InitialEvent extends Event {
  constructor(id = '', label = '', output = null) {
    super(id, label, null, output)
  }
}

module.exports = InitialEvent
