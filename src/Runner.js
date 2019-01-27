const EventEmitter = require('events')
const Event = require('./model/Event')
const Gateway = require('./model/Gateway')
const Activity = require('./model/Activity')
const InitialEvent = require('./model/InitialEvent')
const FinalEvent = require('./model/FinalEvent')

class Runner extends EventEmitter {
  constructor(flow, { mode = 'automatic', interval = 0 } = {}) {
    super()
    this.flow = flow
    this.current = null
    this.mode = mode
    this.interval = interval
    this.isPaused = false
  }

  start() {
    if (this.flow) {
      if (this.current) {
        this.isPaused = false
      } else if (this.flow.initialEvent instanceof InitialEvent) {
        this.current = this.flow.initialEvent
        this.emit('start', this.current)
      }

      this.next()
    }
  }
  pause() {
    this.isPaused = true
  }
  stop() {
    this.isPaused = false
    this.current = null
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
        if (id) {
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

    if (this.current instanceof FinalEvent) {
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
    }
  }
}

module.exports = Runner
