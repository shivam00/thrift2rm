import * as fs from 'fs'
import * as json2md from 'json2md'

import {
    parse,
    StructDefinition,
    ThriftDocument,
} from '@creditkarma/thrift-parser'

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

const transformStructs = (ast: ThriftDocument): any[] => {

    const structures = ast.body
    .filter((def) => def.type === 'StructDefinition')
    .map((def: StructDefinition) => [{
            h2: def.name.value,
        }, {
            table: {
                headers: ['Key', 'Field', 'Type', 'Description', 'Required', 'Default value'],
                rows: def.fields.map((fld) => [
                    fld.fieldID ? fld.fieldID.value : '',
                    fld.name.value,
                    fld.fieldType.type,
                    fld.comments.length ? fld.comments[0].value : '',
                    fld.requiredness,
                    fld.defaultValue || '',
                ]),
            },
        }],
    )

    return [{ h1: 'Data Structures'}, structures]
}

const main = async () => {
    const data = await loadFile('./fixtures/thrift/metadata.thrift')
    const ast = parse(data)
    if (ast.type === 'ThriftErrors') {
        console.dir(ast, {depth: null})
    } else {
        const transform = transformStructs(ast as ThriftDocument)
        const md = json2md(transform)
        console.dir(ast, {depth: null})
        console.log(md)
    }
}

main()
