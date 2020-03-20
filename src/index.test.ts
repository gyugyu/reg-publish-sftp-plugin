import glob from 'glob'
import path from 'path'
import { createLogger } from 'reg-suit-util'
import rimraf from 'rimraf'
import { v4 as uuid } from 'uuid'
import SftpPreparer from './SftpPreparer'
import SftpPublisherPlugin from './SftpPublisherPlugin'

const preparer = new SftpPreparer()

const logger = createLogger()
logger.setLevel('verbose')

const id = uuid()

const baseConfig = {
  coreConfig: { actualDir: '', workingDir: '' },
  logger,
  noEmit: false,
  options: {
    host: '127.0.0.1',
    port: '2222',
    username: 'foo',
    pathPrefix: `uploads/${id}`,
    reportUrlPrefix: 'https://example.com',
  },
}

const from = {
  base: path.join(__dirname, 'fixtures/from'),
  actualDir: path.join(__dirname, 'fixtures/from/actual'),
  expectedDir: path.join(__dirname, 'fixtures/from/expected'),
  diffDir: '',
}

const to = {
  base: path.join(__dirname, 'fixtures/to'),
  actualDir: path.join(__dirname, 'fixtures/to/actual'),
  expectedDir: path.join(__dirname, 'fixtures/to/expected'),
  diffDir: '',
}

beforeEach(() => {
  rimraf.sync(path.join(__dirname, '../sftp-data', id, '*'))
  rimraf.sync(path.join(__dirname, 'fixtures/to'))
})

afterEach(() => {
  rimraf.sync(path.join(__dirname, '../sftp-data', id, '*'))
  rimraf.sync(path.join(__dirname, 'fixtures/to'))
})

test('e2e', async () => {
  const options = await preparer.prepare({
    ...baseConfig,
    workingDirs: from
  })

  const plugin = new SftpPublisherPlugin()
  plugin.init({
    ...baseConfig,
    options: {
      ...options,
      password: 'pass',
    },
    workingDirs: from,
  })
  await plugin.publish('abcdef12345')

  plugin.init({
    ...baseConfig,
    options: {
      ...options,
      password: 'pass',
    },
    workingDirs: to,
  })
  await plugin.fetch('abcdef12345')

  const list = glob.sync('expected/sample.png', { cwd: to.base })
  expect(list[0]).toBe('expected/sample.png')
})
