import * as fs from 'fs'
import * as json2md from 'json2md'

import {
    parse,
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser'

import {
    transformModule,
    transformServices,
    transformStructs,
    transformTypeDefs,
} from './transforms'
import { ThriftMarkdown } from './types';

export const loadFile = (fileName: string): Promise<string> =>
    new Promise((resolve, reject) => {
        fs.readFile(fileName, { encoding: 'utf-8' }, (err, data) => {
            err ? reject(err) : resolve(data)
        })
    })

export const writeFile = (fileName: string) => (md: string): Promise<boolean> =>
    new Promise((resolve, reject) => {
        fs.writeFile(fileName, md, { encoding: 'utf-8' }, (err) => {
            err ? reject(err) : resolve(true)
        })
    })

export const parseThrift = (data: string): Promise<ThriftDocument | ThriftErrors> =>
    Promise.resolve(parse(data))

export const transformDoc = (fileName: string) => (doc: ThriftDocument | ThriftErrors): Promise<string> => {
    if (doc.type === 'ThriftDocument') {
        const transform: ThriftMarkdown = [
            transformModule(fileName)(doc),
            transformTypeDefs(doc),
            transformStructs(doc),
            transformServices(doc),
        ]
        const md = json2md(transform)
        console.dir(doc, {depth: null})
        return Promise.resolve(md)
    } else {
        return Promise.resolve(doc.type)
    }
}
