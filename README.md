<h1 align="center">
  Flow-runner
</h1>
<p align="center">
  <strong>#task-flow #user-flow #node #cli</strong><br/>
  Run a scenario on a task flow with node.js
</p>

**Flow-runner** is a node module to run a scenario on a modelized use case.

> **Flow-runner** only manages BPMN schema for now.

## Install

```bash
# Use as a CLI
$ npm install -g flow-runner

# Use as a node module
$ npm install flow-runner
$ yarn add flow-runner
```

## Getting started

### Use as CLI

```bash
# by default, you will be asked everytime there is a choice
# between two paths in the use case
$ flowrunner model.bpmn
$ flowrunner model.bpmn --interval=3000 # wait 3000ms between each step of the flow
$ flowrunner model.bpmn --verbose # display more information
$ flowrunner model.bpmn --manual # ask for confirmation between each step of the flow
$ flowrunner model.bpmn --scenario # automatize answers
```

### Node API

```js
const flowrunner = require('flow-runner')

flowrunner.parser.parseFilename('model.bpmn').then(models => {
  const runner = new flowrunner.Runner(
    models[0] // a bpmn file may contain several models
    /*
    { // options
      interval: 2000, // 0 by default
      mode: 'manual', // 'automatic' by default
    },
    ['Choose left'] // scenario
    */
  )

  runner.on('start', event => {
    // triggered just after the method start is called
  })

  runner.on('event', event => {
    // triggered when a event is found in the task flow
  })

  runner.on('end', event => {
    // triggered when the final event is found in the task flow
  })

  runner.on('gateway', gateway => {
    // triggered when a gateway is found in the task flow
  })

  runner.on('activity', activity => {
    // triggered when an activity is found in the task flow
  })

  runner.on('pause-requested', () => {
    // triggered after each node in the task flow if the mode is not automatic
    // call runner.next() to manually jump to the next node
  })

  runner.on('choice-requested', ({ current, choices }) => {
    // triggered when a gateway has several available choices
    // call runner.next(<id of the choice to use>) to select the node to choose
    // it won't be called if a scenario is provided
  })

  runner.start()
})
```

## License
