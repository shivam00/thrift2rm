import { parse, ThriftDocument } from '@creditkarma/thrift-parser'
import { expect } from 'code'
import * as Lab from 'lab'
import {
    transformStructs,
} from '../../main/transforms'

export const lab = Lab.script()

const describe = lab.describe
const it = lab.it
const before = lab.before
const beforeEach = lab.beforeEach
const afterEach = lab.afterEach

describe('Transform Thrift Struct', () => {
    let struct

    before(() => {
        struct = transformStructs(parse(`
            struct MetaException {
                1: required string message
            }
        `) as ThriftDocument)
    })

    it('should have a md table', () => {
        expect(struct.length).to.equal(2)
    })
})
