import * as fs from 'fs'
import * as json2md from 'json2md'
import thriftParser = require('thrift-parser')

const loadFile = (fileName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, { encoding: 'utf-8' }, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

const main = async () => {
    const data = await loadFile('./fixtures/thrift/metadata.thrift')
    const json = thriftParser(data)
    json2md.converters.namespace = (input) => `## ${Object.keys(input)[0]}\r\n` + json2md(input)
    json2md.converters.java = (input) => `* ${input[0]}\r\n` + json2md(input)
    json2md.converters.struct = (input) => `### ${input}\r\n` + json2md(input)
    json2md.converters.serviceName = (input) => `### Service Name\r\n` + json2md(input)
    const md = json2md(json)
    console.dir(json)
    console.dir(json.struct)
    console.log(md)
}

main()
