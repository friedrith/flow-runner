const path = require('path')
const fs = require('fs')
const parser = require('../parser')

const Model = require('../model/Model')
const InitialEvent = require('../model/InitialEvent')
const Activity = require('../model/Activity')
const Gateway = require('../model/Gateway')
const FinalEvent = require('../model/FinalEvent')

const filename = path.join(__dirname, '../../data/model.bpmn')

const validateModel = model => {
  expect(model).toBeInstanceOf(Array)
  expect(model).toHaveLength(1)
  expect(model[0]).toBeInstanceOf(Model)

  const { initialEvent } = model[0]
  expect(initialEvent).toBeInstanceOf(InitialEvent)
  expect(initialEvent.label).toEqual('Start software')
  const task = initialEvent.output
  expect(task).toBeInstanceOf(Activity)
  expect(task.label).toEqual('Load file')

  const gateway = task.output
  expect(gateway).toBeInstanceOf(Gateway)
  expect(gateway.label).toEqual('Is it left or right?')

  expect(gateway.outputs).toHaveLength(2)
  const choice1 = gateway.outputs[0]
  expect(choice1).toEqual({
    condition: 'Click on left button',
    target: expect.anything(),
  })
  const task2 = choice1.target
  expect(task2.label).toEqual('Open image')

  const choice2 = gateway.outputs[1]
  expect(choice2).toEqual({
    condition: 'Click on right button',
    target: expect.anything(),
  })

  const task3 = choice2.target
  expect(task3.label).toEqual('Close image')

  expect(task2.output).toBeInstanceOf(Gateway)
  expect(task3.output).toBeInstanceOf(Gateway)

  expect(task2.output.outputs).toBeInstanceOf(Array)
  expect(task2.output.outputs).toHaveLength(1)
  expect(task2.output.outputs[0]).toEqual({
    condition: expect.anything(),
    target: expect.anything(),
  })

  expect(task2.output.outputs[0].target).toBeInstanceOf(FinalEvent)

  expect(task3.output.outputs).toBeInstanceOf(Array)
  expect(task3.output.outputs).toHaveLength(1)
  expect(task3.output.outputs[0]).toEqual({
    condition: expect.anything(),
    target: expect.anything(),
  })

  expect(task3.output.outputs[0].target).toBeInstanceOf(FinalEvent)
}

describe('parseFilename', () => {
  it('should return a model', async () => {
    const model = await parser.parseFilename(filename)
    validateModel(model)
  })
})

describe('parseString', () => {
  it('should return a model', async () => {
    const string = fs.readFileSync(filename, 'utf8')
    const model = await parser.parseString(string)
    validateModel(model)
  })
})
