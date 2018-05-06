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
    ServiceDefinition,
    StructDefinition,
    ThriftDocument,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

const transformIdenitifier = (fld: Identifier) => `[${fld.value}]`

const transformField = (fld: FieldDefinition) => {
    if (fld.fieldType.type === 'Identifier') {
        return transformIdenitifier(fld.fieldType)
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

export const transformStructs = (ast: ThriftDocument): any[] => [
    { h1: 'Data Structures'}, ast.body.filter(isStructure).map(structDefinitionTable),
]

const isService = (def: ServiceDefinition) => def.type === 'ServiceDefinition'

const commaList = (fields: FieldDefinition[]) =>
    fields.reduce((prev, fld) => {
        return prev + `${transformField(fld)} ${fld.name.value}, `
    }, '').slice(0, -2)

const funcSignature = (func: FunctionDefinition) =>
    `${transformIdenitifier(func.returnType as Identifier)} ${func.name.value}`

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

export const transformServices = (ast: ThriftDocument): any[] => [
    { h1: 'Services'}, ast.body.filter(isService).map(serviceDefinitionSection),
]
