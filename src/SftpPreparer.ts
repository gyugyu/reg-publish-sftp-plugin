import {
  PluginPreparer,
  PluginCreateOptions,
  PreparerQuestions,
} from 'reg-suit-interface'
import { PluginConfig } from './SftpPublisherPlugin'
import SftpClient from './SftpClient'
import fetchPrivateKey from './fetchPrivateKey'

export interface SetupInquireResult {
  host?: string;
  port: string;
  username: string;
  reportUrlPrefix?: string;
  pathPrefix?: string;
  testAccessibility?: boolean;
}

export default class SftpPreparer implements PluginPreparer<SetupInquireResult, PluginConfig> {

  private hasCredential(): boolean {
    return !!process.env.SFTP_PASSWORD || !!fetchPrivateKey()
  }

  inquire(): PreparerQuestions {
    return [
      {
        name: 'host',
        type: 'input',
        message: 'Host to log in using SFTP',
      },
      {
        name: 'port',
        type: 'input',
        message: 'Port to log in using SFTP',
        default: '22',
      },
      {
        name: 'username',
        type: 'input',
        message: 'Username to log in using SFTP',
        default: process.env.USER,
      },
      {
        name: 'reportUrlPrefix',
        type: 'input',
        message: 'URL prefix to indicate report location',
      },
      {
        name: 'pathPrefix',
        type: 'input',
        message: 'Path prefix to upload report',
      },
      {
        name: 'testAccessibility',
        type: 'confirm',
        message: 'Test accessibility of SFTP server using',
        when: this.hasCredential,
      },
    ]
  }

  async prepare(config: PluginCreateOptions<SetupInquireResult>): Promise<PluginConfig> {
    const { logger } = config
    const {
      host,
      port,
      username,
      reportUrlPrefix,
      pathPrefix,
      testAccessibility,
    } = config.options

    if (!host || host.length === 0) {
      logger.warn(
        `${logger.colors.magenta('host')} is required parameter, edit this params later.`
      )
    }

    if (!reportUrlPrefix || reportUrlPrefix.length === 0) {
      logger.warn(
        `${logger.colors.magenta('reportUrlPrefix')} is required parameter, edit this params later.`
      )
    }

    if (!this.hasCredential()) {
      logger.warn(
        'Credentials are not configured. Set ' +
        logger.colors.magenta('SFTP_PRIVATE_KEY_PATH, SFTP_PRIVATE_KEY, SFTP_PASSWORD') +
        ' or ' + logger.colors.magenta('password') + ' directive of regconfig.json.'
      )
    }

    if (testAccessibility) {
      const client = new SftpClient({
        host,
        port: parseInt(port, 10),
        username,
        password: process.env.SFTP_PASSWORD,
        privateKey: fetchPrivateKey(),
      })
      try {
        await client.exists('.')
      } catch (e) {
        logger.warn(`Test accessing to SFTP server failed. Reason: ${e}`)
      }
    }

    return {
      host: host ?? 'your-sftp-host',
      port: parseInt(port, 10),
      username,
      reportUrlPrefix: reportUrlPrefix ?? 'https://your-report-url-prefix',
      pathPrefix,
    }
  }
}
