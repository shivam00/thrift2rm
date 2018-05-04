import * as fs from 'fs'
import * as json2md from 'json2md'

import {
    ConstDefinition,
    CppIncludeDefinition,
    EnumDefinition,
    ExceptionDefinition,
    FieldDefinition,
    FunctionDefinition,
    Identifier,
    IncludeDefinition,
    NamespaceDefinition,
    parse,
    ServiceDefinition,
    StructDefinition,
    ThriftDocument,
    TypedefDefinition,
    UnionDefinition,
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

const structFieldRow = (fld: FieldDefinition) => [
    fld.fieldID ? fld.fieldID.value : '',
    fld.name.value,
    transformField(fld),
    fld.comments.length ? fld.comments[0].value : '',
    fld.requiredness,
    fld.defaultValue || '',
]

const structDefinitionTable = (def: StructDefinition) => [{
        h2: `Struct: ${def.name.value}`,
    }, {
        table: {
            headers: ['Key', 'Field', 'Type', 'Description', 'Required', 'Default value'],
            rows: def.fields.map(structFieldRow),
        },
    },
]

const isStructure = (def: StructDefinition) => def.type === 'StructDefinition'

const transformStructs = (ast: ThriftDocument): any[] => [
    { h1: 'Data Structures'}, ast.body.filter(isStructure).map(structDefinitionTable),
]

const isService = (def: ServiceDefinition) => def.type === 'ServiceDefinition'

const commaList = (fields: FieldDefinition[]) =>
    fields.reduce((prev, fld) => {
        return prev + `${transformField(fld)} ${fld.name.value}, `
    }, '').slice(0, -2)

const funcSignature = (func: FunctionDefinition) =>
    `${(func.returnType as Identifier).value} ${func.name.value}`

const transformFunction = (func: FunctionDefinition) => [
    {h3: `Function: ${func.name.value}`}, {
        code: {
            content: `${funcSignature(func)} (${commaList(func.fields)}) throws ${commaList(func.throws)}`,
            language: 'thrift',
        },
    },
]

const serviceDefinitionSection = (def: ServiceDefinition)  => [
    { h2: `Service: ${def.name.value}` }, def.functions.map(transformFunction),
]

const transformServices = (ast: ThriftDocument): any[] => [
    { h1: 'Services'}, ast.body.filter(isService).map(serviceDefinitionSection),
]

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
