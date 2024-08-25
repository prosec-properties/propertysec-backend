import emitter from '@adonisjs/core/services/emitter'
const FileListener = () => import('#listeners/file')

emitter.on('upload:create', [FileListener, 'handle'])
