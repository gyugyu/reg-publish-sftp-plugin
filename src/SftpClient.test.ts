import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import SftpClient from './SftpClient'

const client = new SftpClient({})

const config =  {
  host: '127.0.0.1',
  port: 2222,
  username: 'foo',
}

beforeEach(() => {
  rimraf.sync(path.join(__dirname, '../sftp-data/*'))
})

afterEach(async () => {
  await client.end()
  rimraf.sync(path.join(__dirname, '../sftp-data/*'))
})

test('exists', async () => {
  client.config = {
    ...config,
    password: 'pass',
  }
  fs.mkdirSync(path.join(__dirname, '../sftp-data/path/to/directory'), { recursive: true })
  expect(await client.exists('uploads/path/to/directory')).toBeTruthy()
})

test('makeDirectory', async () => {
  client.config = {
    ...config,
    privateKey: fs.readFileSync(path.join(__dirname, 'fixtures/id_rsa'))
  }
  await client.createDirectory('uploads/path/to/directory')
  const target = path.join(__dirname, '../sftp-data/path/to/directory')
  expect(fs.statSync(target).isDirectory).toBeTruthy()
})

test('uploadDirectory', async () => {
  client.config = {
    ...config,
    password: 'pass',
  }
  await client.uploadDirectory(path.join(__dirname, 'fixtures'), 'uploads/from')
  expect(fs.existsSync(path.join(__dirname, '../sftp-data/from'))).toBeTruthy()
})
