#!/usr/bin/env node

'use strict'

const program = require('commander')
const readline = require('readline')
const chalk = require('chalk')
const Enquirer = require('enquirer')

const packageJson = require('../package')

const Model = require('../src/model/Model')
const InitialEvent = require('../src/model/InitialEvent')
const FinalEvent = require('../src/model/FinalEvent')
const Activity = require('../src/model/Activity')
const Gateway = require('../src/model/Gateway')

const Runner = require('../src/Runner')

const enquirer = new Enquirer()

program
  .version(packageJson.version, '-v, --version')
  .option(
    '-i, --interval <n>',
    'Specify the interval between 2 activities',
    parseInt,
    0
  )
  .option('-m, --manual', 'Run step by step manually')
  .parse(process.argv)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const display = (type, message) => {
  if (type) {
    console.log(`${chalk.blue(`> ${type}: `)}${chalk.bold(message)}`) // eslint-disable-line
  } else {
    console.log(`${chalk.blue('> ')}${message}`) // eslint-disable-line
  }
}

const finalEvent = new FinalEvent('id0', 'Stop')
const initialEvent = new InitialEvent('id1', 'Start')
const task = new Activity('id2', 'open software')
const gateway = new Gateway('id3', 'What is your choice?')
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

const runner = new Runner(model, { interval: program.interval })

runner.on('start', ({ label }) => {
  display('start', label)
})

runner.on('event', ({ label }) => {
  display('event', label)
})

runner.on('end', ({ label }) => {
  display('end', label)
})

runner.on('gateway', ({ label, outputs }) => {
  if (outputs.length === 1) {
    display('gateway', label)
  }
})

runner.on('activity', ({ label }) => {
  display('activity', label)
})

runner.on('choice-requested', ({ current, choices }) => {
  const labels = []
  choices.forEach(({ condition }) => {
    labels.push(condition)
  })
  const question = [
    {
      type: 'select',
      name: 'choice',
      message: current.label,
      choices: [...labels],
    },
  ]
  enquirer.prompt(question).then(answers => {
    const index = labels.indexOf(answers.choice)
    runner.next(choices[index].target.id)
  })

  // const labels = []
  // choices.forEach(({ condition }, index) => {
  //   labels.push(`  ${index}. ${condition}`)
  // })
  //
  // const newChoices = new Choices(labels)
  //
  // newChoices.render()
  /* rl.question(chalk.blue('> ? '), answer => {
    const choice = choices.find(
      (choice, index) =>
        choice.condition === answer || index === parseInt(answer, 10)
    )
    runner.next(choice.target.id)

    rl.close()
  }) */
})

runner.start()
