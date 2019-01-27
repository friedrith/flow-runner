const Event = require('./Event')

class FinalEvent extends Event {
  constructor(id = '', label = '', input) {
    super(id, label, input)
  }
}

module.exports = FinalEvent
