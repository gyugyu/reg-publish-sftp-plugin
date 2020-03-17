import {
  PluginPreparer,
  PluginCreateOptions,
} from 'reg-suit-interface'

export default class SftpPreparer implements PluginPreparer<{}, {}> {

  inquire() {
    return [ 
    ]
  }

  prepare(config: PluginCreateOptions<{}>) {
    return Promise.resolve(config)
  }
}
