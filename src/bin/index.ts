import { parse } from 'path'

import {
    loadFile,
    parseThrift,
    transformDoc,
    writeFile,
} from '../main/'

import { ThriftDocument } from '@creditkarma/thrift-parser';

const args = process.argv.slice(2)
const fileName = args[0]
const outputFile = `./${parse(fileName).name}.md`

const logDoc = (doc: ThriftDocument) => {
    console.dir(doc, {depth: null})
    return Promise.resolve(doc)
}

loadFile(fileName)
    .then(parseThrift)
    .then(transformDoc(fileName))
    .then(writeFile(outputFile))
    .then(console.log)
    .catch(console.error)
