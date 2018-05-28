import {
    BooleanLiteral,
    ExponentialLiteral,
    FloatLiteral,
    HexLiteral,
    IntegerLiteral,
    StringLiteral,
} from '@creditkarma/thrift-parser'

/**
 * Markdown Types
 */
export interface IHeaderFour { h4: string }
export interface IHeaderOne { h1: string }
export interface IHeaderTwo { h2: string }
export interface IHeaderThree { h3: string }
export interface IBlockQuote { blockquote: string }
export interface ITable {
    table: {
        headers: string[],
        rows: StructFieldRow[],
    }
}

/**
 * Thrift Types
 */
export type LiteralValue = StringLiteral | BooleanLiteral | IntegerLiteral | HexLiteral |
FloatLiteral | ExponentialLiteral

/**
 * Transform Types
 */

export type ThriftMarkdown = [
    ModuleSection,
    TypeDefSection,
    StructSection,
    ServiceSection
]

export type ModuleSection = [IHeaderOne, IBlockQuote[]]

export type TypedDefinitionTable = [IHeaderThree, IBlockQuote]
export type TypeDefSection = [IHeaderTwo, TypedDefinitionTable[]]

export type FunctionSection = [IHeaderFour, IBlockQuote]
export type ServiceDefintionSection = [IHeaderThree, FunctionSection[]]
export type ServiceSection = [IHeaderTwo, ServiceDefintionSection[]]

export type StructDefinitionTable = [IHeaderThree, ITable]
export type StructSection = [IHeaderTwo, StructDefinitionTable[]]
export type StructFieldRow = [
    number | null,
    string,
    string,
    string | string[],
    string | null,
    string
]
