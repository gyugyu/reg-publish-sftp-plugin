import fs from 'fs'
import { PluginConfig } from './SftpPublisherPlugin'

export default function fetchPrivateKey(options?: PluginConfig): string | Buffer | undefined {
  if (typeof process.env.SFTP_PRIVATE_KEY_PATH === 'string') {
    return fs.readFileSync(process.env.SFTP_PRIVATE_KEY_PATH)
  }
  if (process.env.SFTP_PRIVATE_KEY) {
    return process.env.SFTP_PRIVATE_KEY
  }
  if (options) {
    return options.privateKey
  }
}
