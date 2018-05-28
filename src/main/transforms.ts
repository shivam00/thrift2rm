import * as path from 'path'

import {
    BaseType,
    BooleanLiteral,
    ConstList,
    ConstMap,
    ConstValue,
    DoubleConstant,
    ExponentialLiteral,
    FieldDefinition,
    FloatLiteral,
    FunctionDefinition,
    HexLiteral,
    Identifier,
    IntConstant,
    IntegerLiteral,
    ListType,
    MapType,
    NamespaceDefinition,
    PrimarySyntax,
    ServiceDefinition,
    SetType,
    StringLiteral,
    StructDefinition,
    SyntaxNode,
    SyntaxType,
    ThriftDocument,
    TypedefDefinition,
    VoidType,
} from '@creditkarma/thrift-parser'

import {
    FunctionSection,
    IBlockQuote,
    IHeaderFour,
    IHeaderOne,
    IHeaderThree,
    IHeaderTwo,
    ITable,
    LiteralValue,
    ModuleSection,
    ServiceDefintionSection,
    ServiceSection,
    StructDefinitionTable,
    StructFieldRow,
    StructSection,
    TypedDefinitionTable,
    TypeDefSection,
} from './types'

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

const transformField = (fld: SyntaxNode): string =>
    syntaxNodeTransform(
        fld,
        (e) => `void`,
        (f) => `list<${transformField(f.valueType)}>`,
        (g) => `map<${transformField(g.valueType)}>`,
        (h) => `set<${transformField(h.valueType)}>`,
        (i) => i.type.split('Keyword')[0].toLowerCase(),
        (z) => `[${z.value}](#${z.value})`,
    )

function literalTransform<U>(
    r: StringLiteral | BooleanLiteral | IntegerLiteral | HexLiteral | FloatLiteral | ExponentialLiteral,
    e: (_: StringLiteral) => U,
    f: (_: BooleanLiteral) => U,
    g: (_: IntegerLiteral) => U,
    h: (_: HexLiteral) => U,
    i: (_: FloatLiteral) => U,
    j: (_: ExponentialLiteral) => U,
): U {
    switch (r.type) {
        case SyntaxType.StringLiteral: return e(r as StringLiteral)
        case SyntaxType.BooleanLiteral: return f(r as BooleanLiteral)
        case SyntaxType.IntegerLiteral: return g(r as IntegerLiteral)
        case SyntaxType.HexLiteral: return h(r as HexLiteral)
        case SyntaxType.FloatLiteral: return i(r as FloatLiteral)
        case SyntaxType.ExponentialLiteral: return j(r as ExponentialLiteral)
        default: return e(r)
    }
}

const getLiteralVal = (
    fld: LiteralValue,
) => literalTransform(
    fld,
    (e) => `"${e.value}"`,
    (f) => `${f.value}`,
    (g) => `${g.value}`,
    (h) => `#${h.value}`,
    (i) => `${i.value}`,
    (j) => `${j.value}`,
)

function constTransform<U>(
    r: ConstValue,
    e: (_: ConstList) => U,
    f: (_: ConstMap) => U,
    g: (_: LiteralValue) => U,
    z: (_: Identifier) => U,
): U {
    switch (r.type) {
        case SyntaxType.ConstList: return e(r as ConstList)
        case SyntaxType.ConstMap: return f(r as ConstMap)
        case SyntaxType.DoubleConstant: return g((r as DoubleConstant).value)
        case SyntaxType.IntConstant: return g((r as IntConstant).value)
        default: return z(r as Identifier)
    }
}

const transformConst = (fld: ConstValue) =>
    constTransform(
        fld,
        (e) => `list<${transformField(e)}>`,
        (f) => `map<${transformField(f)}>`,
        getLiteralVal,
        (z) => `[${z.value}](#${z.value})`,
    )

/**
 * Type Definitions
 */

const typedefDefinitionTable = (def: TypedefDefinition): TypedDefinitionTable => [{
    h3: def.name.value,
}, {
    blockquote: `${transformField(def.definitionType)} ${def.name.value}`,
}]

const isTypeDef = (def: PrimarySyntax) => def.type === 'TypedefDefinition'

export const transformTypeDefs = (ast: ThriftDocument): TypeDefSection => [
    { h2: 'Types'},
    ast.body.filter(isTypeDef).map((stmt) => typedefDefinitionTable(stmt as TypedefDefinition)),
]

/**
 * Structure Transformations
 */
const structFieldRow = (fld: FieldDefinition): StructFieldRow => [
    fld.fieldID ? fld.fieldID.value : null,
    fld.name.value,
    transformField(fld.fieldType),
    fld.comments.length ? fld.comments[0].value : '',
    fld.requiredness || '',
    fld.defaultValue ? transformConst(fld.defaultValue) : '',
]

const structDefinitionTable = (def: StructDefinition): StructDefinitionTable => [{
        h3: def.name.value,
    }, {
        table: {
            headers: ['Key', 'Field', 'Type', 'Description', 'Required', 'Default value'],
            rows: def.fields.map(structFieldRow),
        },
    },
]

const isStructure = (def: PrimarySyntax) => def.type === 'StructDefinition'

export const transformStructs = (ast: ThriftDocument): StructSection => [
    { h2: 'Data Structures' },
    ast.body.filter(isStructure).map((stmt) => structDefinitionTable(stmt as StructDefinition)),
]

/**
 * Service Transformations
 */
const commaList = (fields: FieldDefinition[]) =>
    fields.reduce((prev, fld) => {
        return prev + `${transformField(fld.fieldType)} ${fld.name.value}, `
    }, '').slice(0, -2)

const funcSignature = (func: FunctionDefinition) =>
    `${transformField(func.returnType)} ${func.name.value}`

const funcThrows = (func: FunctionDefinition) =>
    func.throws.length > 0 ? `throws ${commaList(func.throws)}` : ''

const transformFunction = (func: FunctionDefinition): FunctionSection => [{
    h4: `Function: ${func.name.value}`,
}, {
    blockquote: `${funcSignature(func)}(${commaList(func.fields)}) ${funcThrows(func)}`,
}]

const isService = (def: PrimarySyntax) => def.type === 'ServiceDefinition'

const serviceDefinitionSection = (def: ServiceDefinition): ServiceDefintionSection  => [
    { h3: def.name.value },
    def.functions.map(transformFunction),
]

export const transformServices = (ast: ThriftDocument): ServiceSection => [
    { h2: 'Services'},
    ast.body.filter(isService).map((stmt) => serviceDefinitionSection(stmt as ServiceDefinition)),
]

/**
 * Module Transformations
 */
const isNamespaceDefinition = (def: PrimarySyntax) => def.type === 'NamespaceDefinition'

const namespaceDefinition = (namespace: NamespaceDefinition) => (
    { blockquote: `${namespace.name.value}` }
)

export const transformModule = (fileName: string) => (ast: ThriftDocument): ModuleSection => [
    { h1: `${path.parse(fileName).base.split('.')[0]}` },
    ast.body.filter(isNamespaceDefinition).map((stmt) => namespaceDefinition(stmt as NamespaceDefinition)),
]
