import glob from 'glob'
import path from 'path'
import mkdirp from 'mkdirp'
import {
  WorkingDirectoryInfo,
  PublisherPlugin,
  PluginCreateOptions,
  PluginLogger,
} from 'reg-suit-interface'
import { ConnectConfig } from 'ssh2'
import SftpClient from './SftpClient'
import fetchPrivateKey from './fetchPrivateKey'

export interface PluginConfig extends ConnectConfig {
  reportUrlPrefix: string;
  pathPrefix?: string;
}

export default class SftpPublisherPlugin implements PublisherPlugin<PluginConfig> {
  private option!: PluginCreateOptions<PluginConfig>
  private pluginConfig!: PluginConfig
  private logger!: PluginLogger
  private workingDirs!: WorkingDirectoryInfo
  private client!: SftpClient

  init(config: PluginCreateOptions<PluginConfig>) {
    this.option = config
    this.logger = config.logger
    this.workingDirs = config.workingDirs

    this.pluginConfig = {
      ...config.options,
      password: process.env.SFTP_PASSWORD ?? config.options.password,
      privateKey: fetchPrivateKey(config.options),
    }

    this.client = new SftpClient(this.pluginConfig)
  }

  private resolveOnRemote(key: string): string {
    const { pathPrefix } = this.pluginConfig
    if (typeof pathPrefix === 'string') {
      return `${pathPrefix}/${key}`
    }
    return key
  }

  private getUrlPrefix(): string {
    const { reportUrlPrefix } = this.pluginConfig
    if (reportUrlPrefix.endsWith('/')) {
      return reportUrlPrefix.slice(0, reportUrlPrefix.length - 1)
    }
    return reportUrlPrefix
  }

  async fetch(key: string) {
    if (this.option.noEmit) return
    const actualPrefix = `${this.resolveOnRemote(key)}/${path.basename(this.workingDirs.actualDir)}`
    if (!await this.client.exists(actualPrefix)) {
      await this.client.end()
      return
    }

    const progress = this.logger.getProgressBar()
    progress.start(1, 0)
    mkdirp.sync(this.workingDirs.expectedDir)
    await this.client.downloadDirectory(actualPrefix, this.workingDirs.expectedDir)
    await this.client.end()
    progress.increment(1)
    progress.stop()
  }

  async publish(key: string) {
    const progress = this.logger.getProgressBar()
    progress.start(1, 0)

    await this.client.createDirectory(this.resolveOnRemote(key))
    await this.client.uploadDirectory(this.workingDirs.base, this.resolveOnRemote(key))
    await this.client.end()
    progress.increment(1)
    progress.stop()

    const list = await new Promise<string[]>((resolve, reject) => {
      glob('**/*.html', {
        cwd: this.workingDirs.base,
        nodir: true,
      }, (err, list) => {
        if (err) return reject(err)
        resolve(list)
      })
    })
    const indexFile = list.find(item => item.endsWith('index.html'))

    const reportUrl = indexFile && `${this.getUrlPrefix()}/${key}/${indexFile}`
    return { reportUrl }
  }
}
