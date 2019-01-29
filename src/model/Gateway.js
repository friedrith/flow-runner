class Gateway {
  constructor(id = '', label = '', inputs = [], outputs = []) {
    this.id = id
    this.label = label
    this.inputs = inputs
    this.outputs = outputs
    this.type = ''
  }
}

module.exports = Gateway
