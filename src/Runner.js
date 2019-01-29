const EventEmitter = require('events')
const Event = require('./model/Event')
const Gateway = require('./model/Gateway')
const Activity = require('./model/Activity')
const InitialEvent = require('./model/InitialEvent')
const FinalEvent = require('./model/FinalEvent')

class Runner extends EventEmitter {
  constructor(
    flow,
    { mode = 'automatic', interval = 0 } = {},
    scenario = null
  ) {
    super()
    this.flow = flow
    this.current = null
    this.mode = mode
    this.interval = interval
    this.isPaused = false
    this.scenario = scenario
    this.scenarioIndex = 0
  }

  start() {
    if (this.flow) {
      if (this.current) {
        this.isPaused = false
      } else if (this.flow.initialEvent instanceof InitialEvent) {
        this.current = this.flow.initialEvent
      }
      this.alert()
    }
  }
  pause() {
    this.isPaused = true
  }
  stop() {
    this.isPaused = false
    this.current = null
  }

  alert() {
    if (!this.current || this.isPaused) {
      return
    }

    if (this.current instanceof InitialEvent) {
      this.emit('start', this.current)
    } else if (this.current instanceof FinalEvent) {
      this.emit('end', this.current)
      return
    } else if (this.current instanceof Event) {
      this.emit('event', this.current)
    } else if (this.current instanceof Gateway) {
      this.emit('gateway', this.current)
    } else if (this.current instanceof Activity) {
      this.emit('activity', this.current)
    }

    if (this.mode === 'automatic') {
      setTimeout(() => {
        this.next()
      }, this.interval)
    } else {
      this.emit('pause-requested')
    }
  }

  next(id = null) {
    if (!this.current || this.isPaused) {
      return
    }
    if (this.current instanceof Event) {
      this.current = this.current.output
    } else if (this.current instanceof Gateway) {
      if (this.current.outputs.length === 1) {
        this.current = this.current.outputs[0].target
      } else if (this.current.outputs.length > 1) {
        if (this.scenario) {
          const nextNode = this.current.outputs.find(
            output => output.condition === this.scenario[this.scenarioIndex]
          )
          this.current = nextNode.target
          this.scenarioIndex += 1
          this.emit('choice-made', {
            choice: nextNode,
          })
        } else if (id) {
          const nextNode = this.current.outputs.find(
            output => output.target.id === id
          ).target
          if (nextNode) {
            this.current = nextNode
          } else {
            this.emit('error', {
              reason: 'id-not-found',
              data: { id, choices: this.current.outputs },
            })
          }
        } else {
          this.emit('choice-requested', {
            current: this.current,
            choices: this.current.outputs,
          })
          return
        }
      } else {
        this.emit('error', { reason: 'gateway-no-outputs', data: this.current })
        return
      }
    } else if (this.current instanceof Activity) {
      this.current = this.current.output
    } else {
      this.emit('error', { reason: 'unknown-node', data: this.current })
      return
    }

    this.alert()
  }
}

module.exports = Runner
