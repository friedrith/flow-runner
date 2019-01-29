#!/usr/bin/env node

'use strict'

/**
 * - user experience
 * - BPMN
 *
 * - https://github.com/enquirer/enquirer
 * - https://github.com/chalk/chalk
 * - https://github.com/tj/commander.js/
 * - https://github.com/75lb/command-line-args
 * - https://github.com/enquirer/prompt-choices
 */

const program = require('commander')
const chalk = require('chalk')
const Enquirer = require('enquirer')

const packageJson = require('../package')

const Runner = require('../src/Runner')
const parser = require('../src/parser')

const enquirer = new Enquirer()

program
  .version(packageJson.version)
  .usage('[options] <file ...>')
  .option(
    '-i, --interval <n>',
    'Specify the interval between 2 activities',
    parseInt,
    0
  )
  .option('-v, --verbose', 'Increase the verbosity')
  .option('-s, --scenario <filename>', 'Scenario to run flow automatically')
  .option('-m, --manual', 'Run step by step manually')
  .parse(process.argv)

const display = (type, message) => {
  if (type) {
    console.log(`${chalk.blue(`> ${type}: `)}${chalk.bold(message)}`) // eslint-disable-line
  } else {
    console.log(`${chalk.blue('> ')}${message}`) // eslint-disable-line
  }
}

parser.parseFilename(program.args[0]).then(async models => {
  const runner = new Runner(
    models[0],
    {
      interval: program.interval,
      mode: program.manual ? 'manual' : 'automatic',
    },
    program.scenario ? await parser.parseScenario(program.scenario) : null
  )

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
    if (outputs.length === 1 || program.verbose || program.scenario) {
      display('gateway', label)
    }
  })

  runner.on('activity', ({ label }) => {
    display('activity', label)
  })

  runner.on('pause-requested', () => {
    const question = [
      {
        type: 'confirm',
        name: 'confirm',
        initial: 'yes',
        message: 'Next step ?',
      },
    ]
    enquirer.prompt(question).then(answers => {
      if (answers.confirm) {
        runner.next()
      } else {
        runner.stop()
        return
      }
    })
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
  })

  runner.on('choice-made', ({ choice }) => {
    display(null, choice.condition)
  })

  runner.start()
})
