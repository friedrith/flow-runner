class Activity {
  constructor(id = '', label = '', input = null, outputs = []) {
    this.id = id
    this.label = label
    this.input = input
    this.outputs = outputs
    this.type = ''
  }
}

module.exports = Activity
