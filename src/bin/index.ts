import {
    loadFile,
    parseThrift,
    transformDoc,
    writeFile,
} from '../main/'

const fileName = './fixtures/thrift/metadata.thrift'

loadFile(fileName)
    .then(parseThrift)
    .then(transformDoc(fileName))
    .then(writeFile('./metadata.md'))
    .then(console.log)
    .catch(console.error)
