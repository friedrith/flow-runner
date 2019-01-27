class Event {
  constructor(id = '', label = '', input = null, output = null) {
    this.id = id
    this.label = label
    this.input = input
    this.output = output
  }
}

module.exports = Event
