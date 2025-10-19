import emitter from '@adonisjs/core/services/emitter'
const FileListener = () => import('#listeners/file')
const UserListener = () => import('#listeners/user')

emitter.on('upload:create', [FileListener, 'handle'])
emitter.on('user:registered', [UserListener, 'onRegistered'])
