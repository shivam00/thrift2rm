import * as fs from 'fs'
import * as json2md from 'json2md'

import {
    parse,
} from '@creditkarma/thrift-parser'

import {
    transformServices,
    transformStructs,
} from './transforms'

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

export const transformFile = async (fileName: string) => {
    const data = await loadFile(fileName)
    const ast = parse(data)
    if (ast.type === 'ThriftDocument') {
        const transform = [].concat(
            ...transformStructs(ast),
            ...transformServices(ast),
        )
        const md = json2md(transform)
        console.dir(ast, {depth: null})
        console.log(md)
    } else {
        console.dir(ast, {depth: null})
    }
}
