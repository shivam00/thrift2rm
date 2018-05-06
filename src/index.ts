import * as fs from 'fs'
import * as json2md from 'json2md'

import {
    parse,
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser'

import {
    transformServices,
    transformStructs,
} from './transforms'

export function loadFile(fileName: string): Promise<string> {
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

export function parseThrift(data: string): Promise<ThriftDocument | ThriftErrors> {
    return Promise.resolve(parse(data))
}

export function transformDoc(doc: ThriftDocument): Promise<string> {
    const transform = [].concat(
        ...transformStructs(doc),
        ...transformServices(doc),
    )
    const md = json2md(transform)
    console.dir(doc, {depth: null})
    return Promise.resolve(md)
}
