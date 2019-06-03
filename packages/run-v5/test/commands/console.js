'use strict'

const expect = require('unexpected')
const sinon = require('sinon')
const Dyno = require('../../lib/dyno')
const cmd = require('../../commands/console')

describe('console', () => {
  let dynoStub, dynoOpts

  beforeEach(() => {
    dynoStub = sinon.stub(Dyno.prototype, 'start').callsFake(function () {
      dynoOpts = this.opts
      return Promise.resolve()
    })
  })

  it('runs console', async () => {
    await cmd.run({ app: 'heroku-run-test-app', flags: {} })
    expect(dynoOpts.command, 'to equal', 'console')
  })

  afterEach(() => {
    dynoStub.restore()
  })
})
