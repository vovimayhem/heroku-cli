'use strict'

const cli = require('heroku-cli-util')
const co = require('co')

function * run (context, heroku) {
  const host = require('../lib/host')
  const util = require('../lib/util')
  const fetcher = require('../lib/fetcher')(heroku)
  let { app, args, flags } = context
  let db = yield fetcher.addon(app, args.database)

  if (util.starterPlan(db)) throw new Error('pg:repoint is only available for follower production databases')

  let replica = yield heroku.get(`/client/v11/databases/${db.id}`, { host: host(db) })

  if (!replica.following) {
    throw new Error('pg:repoint is only available for follower production databases')
  }

  let origin = util.databaseNameFromUrl(replica.following, yield heroku.get(`/apps/${app}/config-vars`))

  let newLeader = yield fetcher.addon(app, flags.follow)

  yield cli.confirmApp(app, flags.confirm, `WARNING: Destructive action
${cli.color.addon(db.name)} will be repointed to follow ${newLeader.name}, and stop following ${origin}.

This cannot be undone.`)

  let data = { follow: newLeader.id }
  yield cli.action(`Starting repoint of ${cli.color.addon(db.name)}`, co(function * () {
    yield heroku.post(`/client/v11/databases/${db.id}/repoint`, { host: host(db), body: data })
    cli.action.done(`${cli.color.cmd('heroku pg:wait')} to track status`)
  }))
}

module.exports = {
  topic: 'pg',
  command: 'repoint',
  description: 'changes which leader a follower is following',
  help: `Example:

    heroku pg:repoint postgresql-transparent-56874 --follow postgresql-lucid-59103 -a woodstock-production
`,
  needsApp: true,
  needsAuth: true,
  args: [{ name: 'database', optional: true }],
  flags: [
    { name: 'confirm', char: 'c', hasValue: true },
    { name: 'follow', description: 'leader database to follow', hasValue: true }
  ],
  run: cli.command({ preauth: true }, co.wrap(run))
}
