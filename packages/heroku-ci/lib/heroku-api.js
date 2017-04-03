const https = require('https')
const KOLKRABBI = 'https://kolkrabbi.heroku.com'
const V3_HEADER = 'application/vnd.heroku+json; version=3'
const VERSION_HEADER = `${V3_HEADER}.ci`
const PIPELINE_HEADER = `${V3_HEADER}.pipelines`

function* pipelineCoupling (client, app) {
  return client.get(`/apps/${app}/pipeline-couplings`)
}

function* pipelineRepository (client, pipelineID) {
  return client.request({
    host: KOLKRABBI,
    path: `/pipelines/${pipelineID}/repository`,
    headers: {
      Authorization: `Bearer ${client.options.token}`
    }
  })
}

function* githubArchiveLink (client, user, repository, ref) {
  return client.request({
    host: KOLKRABBI,
    path: `/github/repos/${user}/${repository}/tarball/${ref}`,
    headers: {
      Authorization: `Bearer ${client.options.token}`
    }
  })
}

function* testRun (client, pipelineID, number) {
  return client.request({
    path: `/pipelines/${pipelineID}/test-runs/${number}`,
    headers: {
      Authorization: `Bearer ${client.options.token}`,
      Accept: VERSION_HEADER
    }
  })
}

function* testNodes (client, testRunIdD) {
  return client.request({
    path: `/test-runs/${testRunIdD}/test-nodes`,
    headers: {
      Authorization: `Bearer ${client.options.token}`,
      Accept: VERSION_HEADER
    }
  })
}

function* testRuns (client, pipelineID) {
  return client.request({
    path: `/pipelines/${pipelineID}/test-runs`,
    headers: {
      Authorization: `Bearer ${client.options.token}`,
      Accept: VERSION_HEADER
    }
  })
}

function* latestTestRun (client, pipelineID) {
  const latestTestRuns = yield client.request({
    path: `/pipelines/${pipelineID}/test-runs`,
    headers: {
      Authorization: `Bearer ${client.options.token}`,
      Accept: VERSION_HEADER,
      Range: 'number ..; order=desc,max=1'
    }
  })

  return Promise.resolve(latestTestRuns[0])
}

function updateTestRun (client, id, body) {
  return client.request({
    body,
    method: 'PATCH',
    path: `/test-runs/${id}`,
    headers: {
      Accept: VERSION_HEADER
    }
  })
}

function logStream (url, fn) {
  return https.get(url, fn)
}

function* createSource (client) {
  return yield client.post(`/sources`)
}

function* createTestRun (client, body) {
  const headers = {
    Accept: VERSION_HEADER
  }

  return client.request({
    headers: headers,
    method: 'POST',
    path: '/test-runs',
    body: body
  })
}

function configVars (client, pipelineID) {
  return client.request({
    headers: { Accept: PIPELINE_HEADER },
    path: `/pipelines/${pipelineID}/stage/test/config-vars`
  })
}

function setConfigVars (client, pipelineID, body) {
  return client.request({
    method: 'PATCH',
    headers: { Accept: PIPELINE_HEADER },
    path: `/pipelines/${pipelineID}/stage/test/config-vars`,
    body
  })
}

function appSetup (client, id) {
  return client.get(`/app-setups/${id}`)
}

module.exports = {
  appSetup,
  configVars,
  createSource,
  createTestRun,
  githubArchiveLink,
  latestTestRun,
  testNodes,
  testRun,
  testRuns,
  logStream,
  pipelineCoupling,
  pipelineRepository,
  setConfigVars,
  updateTestRun
}
