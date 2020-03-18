import Client from 'ssh2-sftp-client'
import { ConnectConfig } from 'ssh2'

export default class SftpClient {
  config: ConnectConfig
  private sftp: Client
  private connected: boolean

  constructor(config: ConnectConfig) {
    this.sftp = new Client()
    this.config = config
    this.connected = false
  }

  private async init() {
    if (!this.connected) {
      await this.sftp.connect(this.config)
      this.connected = true
    }
  }

  async exists(remoteFilePath: string) {
    await this.init()
    return await this.sftp.exists(remoteFilePath)
  }

  async downloadDirectory(srcDir: string, dstDir: string) {
    await this.init()
    await (this.sftp as any).downloadDir(srcDir, dstDir)
  }

  async createDirectory(remoteFilePath: string) {
    await this.init()
    await this.sftp.mkdir(remoteFilePath, true)
  }

  async uploadDirectory(srcDir: string, dstDir: string) {
    await this.init()
    await (this.sftp as any).uploadDir(srcDir, dstDir)
  }

  async end() {
    if (this.connected) {
      await this.sftp.end()
      this.sftp = new Client()
      this.connected = false
    }
  }
}
