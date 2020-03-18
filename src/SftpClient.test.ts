import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import SftpClient from './SftpClient'

const client = new SftpClient({})

const config =  {
  host: '127.0.0.1',
  port: 2222,
  username: 'foo',
  password: 'pass',
}

beforeEach(() => {
  rimraf.sync(path.join(__dirname, '../sftp-data/*'))
  client.config = config
})

afterEach(async () => {
  await client.end()
  rimraf.sync(path.join(__dirname, '../sftp-data/*'))
})

test('exists', async () => {
  fs.mkdirSync(path.join(__dirname, '../sftp-data/path/to/directory'), { recursive: true })
  expect(await client.exists('uploads/path/to/directory')).toBeTruthy()
})

test('makeDirectory', async () => {
  await client.createDirectory('uploads/path/to/directory')
  expect(fs.existsSync(path.join(__dirname, '../sftp-data/path/to/directory'))).toBeTruthy()
})
