const fs = require('fs')
const xml2js = require('xml2js')

const Model = require('./model/Model')
const InitialEvent = require('./model/InitialEvent')
const FinalEvent = require('./model/FinalEvent')
const Activity = require('./model/Activity')
const Gateway = require('./model/Gateway')

const parseString = data => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser()
    parser.parseString(data, (err, result) => {
      if (err) {
        reject(err)
      }
      const models = []
      result['model:definitions']['model:process'].forEach(xml => {
        const items = {}
        let initialEvent = null
        xml['model:startEvent'].forEach(({ $: item }) => {
          const startEvent = new InitialEvent(item.id, item.name)
          initialEvent = startEvent
          items[item.id] = startEvent
        })
        xml['model:userTask'].forEach(({ $: item }) => {
          const userTask = new Activity(item.id, item.name)
          userTask.type = 'user'
          items[item.id] = userTask
        })
        xml['model:scriptTask'].forEach(({ $: item }) => {
          const scriptTask = new Activity(item.id, item.name)
          scriptTask.type = 'script'
          items[item.id] = scriptTask
        })
        xml['model:inclusiveGateway'].forEach(({ $: item }) => {
          const inclusiveGateway = new Gateway(item.id, item.name)
          inclusiveGateway.type = 'inclusive'
          items[item.id] = inclusiveGateway
        })
        xml['model:exclusiveGateway'].forEach(({ $: item }) => {
          const exclusiveGateway = new Gateway(item.id, item.name)
          exclusiveGateway.type = 'exclusive'
          items[item.id] = exclusiveGateway
        })
        xml['model:endEvent'].forEach(({ $: item }) => {
          const endEvent = new FinalEvent(item.id, item.name)
          endEvent.type = 'end'
          items[item.id] = endEvent
        })
        xml['model:sequenceFlow'].forEach(({ $: item }) => {
          const source = items[item.sourceRef]
          const target = items[item.targetRef]

          target.input = source

          if (source instanceof Gateway) {
            source.outputs.push({
              condition: item.name,
              target,
            })
          } else {
            source.output = target
          }
        })

        models.push(new Model(initialEvent))
      })
      resolve(models)
    })
  })
}

const parseFilename = filename => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        reject(err)
        return
      }
      parseString(data)
        .then(models => {
          resolve(models)
        })
        .catch(err => {
          reject(err)
        })
    })
  })
}

const parseScenario = filename => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        reject(err)
        return
      }

      resolve(data.split('\n'))
    })
  })
}

module.exports = {
  parseString,
  parseFilename,
  parseScenario,
}
