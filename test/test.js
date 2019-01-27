const readline = require('readline')

const Model = require('../src/model/Model')
const InitialEvent = require('../src/model/InitialEvent')
const FinalEvent = require('../src/model/FinalEvent')
const Activity = require('../src/model/Activity')
const Gateway = require('../src/model/Gateway')

const Runner = require('../src/Runner')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const finalEvent = new FinalEvent('id0', 'Stop')
const initialEvent = new InitialEvent('id1', 'Start')
const task = new Activity('id2', 'open software')
const gateway = new Gateway('id3', 'choice')
const task2 = new Activity('id4', 'close software left')
const task3 = new Activity('id5', 'close software right')

initialEvent.output = task
task.input = initialEvent
task.output = gateway
gateway.inputs.push(task)
gateway.outputs.push({
  target: task2,
  condition: 'left',
})

gateway.outputs.push({
  target: task3,
  condition: 'right',
})

task2.input = gateway
task2.output = finalEvent
task3.input = gateway
task3.output = finalEvent
finalEvent.input = task2

const model = new Model(initialEvent, finalEvent)

const runner = new Runner(model)

runner.on('start', () => {
  console.log('start')
})

runner.on('event', () => {
  console.log('event')
})

runner.on('end', () => {
  console.log('end')
})

runner.on('gateway', gateway => {
  console.log(`gateway ${gateway.label}`)
})

runner.on('activity', activity => {
  console.log(`activity ${activity.label}`)
})

runner.on('choice-requested', ({ current, choices }) => {
  console.log('choice to do')
  choices.forEach(({ condition }, index) => {
    console.log(`${index}. ${condition}`)
  })

  rl.question('What is your choice?', answer => {
    const choice = choices.find(
      (choice, index) =>
        choice.condition === answer || index === parseInt(answer, 10)
    )
    runner.next(choice.target.id)

    rl.close()
  })
})

runner.start()
