import { parse, ThriftDocument } from '@creditkarma/thrift-parser'
import { expect } from 'code'
import * as Lab from 'lab'
import {
    transformServices,
    transformStructs,
} from '../../main/transforms'
import {
    ServiceSection,
} from '../../main/types'
export const lab = Lab.script()

const describe = lab.describe
const it = lab.it
const before = lab.before
const beforeEach = lab.beforeEach
const afterEach = lab.afterEach

describe('Transform Thrift Struct', () => {
    let struct: any[]

    before(() => {
        struct = transformStructs(parse(`
            typedef string ItemID

            struct Item {
                1: required ItemID itemId;
                2: required i32 version;
                3: required string name;
                4: optional string description;
            }
        `) as ThriftDocument)
    })

    it('should have a md header and table', () => {
        expect(struct.length).to.equal(2)
    })

    it('should have a md table object', () => {
        const def = [].concat(...struct).filter((obj) => Object.keys(obj)[0] === 'table')
        expect(def.length).to.equal(1)
    })
})

describe('Transform Thrift Services', () => {
    let services: ServiceSection

    before(() => {
        services = transformServices(parse(`
            service MetaService {
                Metadata echo(1: string val) throws (1: MetaException ex)
                void echo(1: string val) throws (1: MetaException ex)
            }
        `) as ThriftDocument)
    })

    it('should have one service block', () => {
        expect(services.length).to.equal(2)
    })

    it('should have a h3 object', () => {
        const serviceDefinition = [services].filter((obj) => Object.keys(obj)[0] === 'h3')
        expect(serviceDefinition.length).to.equal(1)
    })

    it('should have a h4 funciton object', () => {
        const serviceFunc = services[1][1].filter((obj) => Object.keys(obj)[0] === 'h4')
        expect(serviceFunc.length).to.equal(1)
    })
})
