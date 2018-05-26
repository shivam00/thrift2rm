import * as path from 'path'

import {
    BaseType,
    FieldDefinition,
    FunctionDefinition,
    Identifier,
    ListType,
    MapType,
    NamespaceDefinition,
    PrimarySyntax,
    ServiceDefinition,
    SetType,
    StructDefinition,
    SyntaxNode,
    SyntaxType,
    ThriftDocument,
    TypedefDefinition,
    VoidType,
} from '@creditkarma/thrift-parser'

/**
 * Common Transformations
 */

function syntaxNodeTransform<U>(
    r: SyntaxNode,
    e: (_: VoidType) => U,
    f: (_: ListType) => U,
    g: (_: MapType) => U,
    h: (_: SetType) => U,
    i: (_: BaseType) => U,
    z: (_: Identifier) => U,
): U {
    switch (r.type) {
        case SyntaxType.VoidKeyword: return e(r as VoidType)
        case SyntaxType.ListType: return f(r as ListType)
        case SyntaxType.MapType: return g(r as MapType)
        case SyntaxType.SetType: return h(r as SetType)
        case SyntaxType.StringKeyword: return i(r as BaseType)
        case SyntaxType.I8Keyword: return i(r as BaseType)
        case SyntaxType.BinaryKeyword: return i(r as BaseType)
        case SyntaxType.BoolKeyword: return i(r as BaseType)
        case SyntaxType.ByteKeyword: return i(r as BaseType)
        case SyntaxType.DoubleKeyword: return i(r as BaseType)
        case SyntaxType.EnumKeyword: return i(r as BaseType)
        case SyntaxType.I16Keyword: return i(r as BaseType)
        case SyntaxType.I32Keyword: return i(r as BaseType)
        case SyntaxType.I64Keyword: return i(r as BaseType)
        default: return z(r as Identifier)
    }
}

const transformField = (fld: SyntaxNode) =>
    syntaxNodeTransform(
        fld,
        (e) => `void`,
        (f) => `list<${transformField(f.valueType)}>`,
        (g) => `map<${transformField(g.valueType)}>`,
        (h) => `set<${transformField(h.valueType)}>`,
        (i) => i.type.split('Keyword')[0].toLowerCase(),
        (z) => `[${z.value}](#${z.value})`,
    )

/**
 * Type Definitions
 */
const typedefDefinitionTable = (def: TypedefDefinition) => [{
    h3: def.name.value,
}, {
    blockquote: `${transformField(def.definitionType)} ${def.name.value}`,
}]

const isTypeDef = (def: PrimarySyntax) => def.type === 'TypedefDefinition'

export const transformTypeDefs = (ast: ThriftDocument): any[] => [
    { h2: 'Types'}, ...ast.body.filter(isTypeDef).map(typedefDefinitionTable),
]

/**
 * Structure Transformations
 */

const structFieldRow = (fld: FieldDefinition) => [
    fld.fieldID ? fld.fieldID.value : '',
    fld.name.value,
    transformField(fld.fieldType),
    fld.comments.length ? fld.comments[0].value : '',
    fld.requiredness,
    fld.defaultValue || '',
]

const structDefinitionTable = (def: StructDefinition) => [{
        h3: def.name.value,
    }, {
        table: {
            headers: ['Key', 'Field', 'Type', 'Description', 'Required', 'Default value'],
            rows: def.fields.map(structFieldRow),
        },
    },
]

const isStructure = (def: PrimarySyntax) => def.type === 'StructDefinition'

export const transformStructs = (ast: ThriftDocument): any[] => [
    { h2: 'Data Structures'}, ...ast.body.filter(isStructure).map(structDefinitionTable),
]

/**
 * Service Transformations
 */

const isService = (def: PrimarySyntax) => def.type === 'ServiceDefinition'

const commaList = (fields: FieldDefinition[]) =>
    fields.reduce((prev, fld) => {
        return prev + `${transformField(fld.fieldType)} ${fld.name.value}, `
    }, '').slice(0, -2)

const funcSignature = (func: FunctionDefinition) =>
    `${transformField(func.returnType)} ${func.name.value}`

const transformFunction = (func: FunctionDefinition) => {
    const throws = func.throws.length > 0 ? `throws ${commaList(func.throws)}` : ''
    return [{
        h4: `Function: ${func.name.value}`,
    }, {
        blockquote: `${funcSignature(func)}(${commaList(func.fields)}) ${throws}`,
    }]
}

const serviceDefinitionSection = (def: ServiceDefinition)  => [
    { h3: def.name.value }, ...def.functions.map(transformFunction),
]

export const transformServices = (ast: ThriftDocument): any[] => [
    { h2: 'Services'}, ...ast.body.filter(isService).map(serviceDefinitionSection),
]

/**
 * Module Transformations
 */
const isNamespaceDefinition = (def: PrimarySyntax) => def.type === 'NamespaceDefinition'

export const transformModule = (fileName: string) => (ast: ThriftDocument): any[] => {
    const results: object[] = [
        { h1: `${path.parse(fileName).base.split('.')[0]}` },
    ]

    const namespace = (ast.body.find(isNamespaceDefinition) as NamespaceDefinition)
    if (namespace) {
        results.push({ blockquote: `${namespace.name.value}` })
    }

    return results
}
