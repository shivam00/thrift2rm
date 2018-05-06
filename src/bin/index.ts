import {
    loadFile,
    parseThrift,
    transformDoc,
} from '../index'

loadFile('./fixtures/thrift/metadata.thrift')
    .then(parseThrift)
    .then(transformDoc)
    .then(console.log)
    .catch(console.error)
