import { PublisherPluginFactory }  from 'reg-suit-interface'
import SftpPreparar from './SftpPreparer'
import SftpPublisherPlugin from './SftpPublisherPlugin'

const pluginFactory: PublisherPluginFactory = () => {
  return {
    preparer: new SftpPreparar(),
    publisher: new SftpPublisherPlugin(),
  }
}

export = pluginFactory
