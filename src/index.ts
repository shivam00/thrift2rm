import * as fs from 'fs'
import * as json2md from 'json2md'

import {
    FieldDefinition,
    Identifier,
    parse,
    ServiceDefinition,
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

const transformField = (fld: FieldDefinition) => {
    if (fld.fieldType.type === 'Identifier') {
        return (fld.fieldType as Identifier).value
    } else if (fld.fieldType.type.indexOf('Keyword') > 0) {
        return fld.fieldType.type.split('Keyword')[0]
    } else if (fld.fieldType.type.indexOf('Identifier') > 0) {
        return fld.fieldType.type.split('Identifier')[0]
    } else {
        return fld.fieldType.type
    }
}

const transformStructs = (ast: ThriftDocument): any[] => {

    const structures = ast.body
    .filter((def) => def.type === 'StructDefinition')
    .map((def: StructDefinition) => [{
            h2: `Struct: ${def.name.value}`,
        }, {
            table: {
                headers: ['Key', 'Field', 'Type', 'Description', 'Required', 'Default value'],
                rows: def.fields.map((fld) => [
                    fld.fieldID ? fld.fieldID.value : '',
                    fld.name.value,
                    transformField(fld),
                    fld.comments.length ? fld.comments[0].value : '',
                    fld.requiredness,
                    fld.defaultValue || '',
                ]),
            },
        }],
    )

    return [{ h1: 'Data Structures'}, structures]
}

const transformServices = (ast: ThriftDocument): any[] => {
    const services = ast.body
        .filter((def) => def.type === 'ServiceDefinition')
        .map((def: ServiceDefinition) => {
            const functions = def.functions.map((func) => {
                const fields = func.fields.reduce((prev, fld) => {
                    return prev + `${transformField(fld)} ${fld.name.value}, `
                }, '')
                const exceptions = func.throws.reduce((prev, fld) => {
                    return prev + `${transformField(fld)} ${fld.name.value} `
                }, '')
                const signature = `${(func.returnType as Identifier).value} ${func.name.value}`
                return [{
                    h3: `Function: ${func.name.value}`,
                }, {
                    code: {
                        content: `${signature} (${fields}) throws ${exceptions}`,
                        language: 'thrift',
                    },
                }]
            })
            return [{ h2: `Service: ${def.name.value}` }, functions]
        })
    return [{ h1: 'Services'}, services]
}

const main = async () => {
    const data = await loadFile('./fixtures/thrift/metadata.thrift')
    const ast = parse(data)
    if (ast.type === 'ThriftErrors') {
        console.dir(ast, {depth: null})
    } else {
        const transform = [].concat(
            ...transformStructs(ast as ThriftDocument),
            ...transformServices(ast as ThriftDocument),
        )
        const md = json2md(transform)
        console.dir(ast, {depth: null})
        console.log(md)
    }
}

main()
