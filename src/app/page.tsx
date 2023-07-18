import 'server-only';
import HomeContainer from '../components/Home'
import { init } from '@jamsocket/javascript/server'

const IS_DEV = process.env.NODE_ENV === 'development'
const ACCOUNT_NAME = 'taylor'
const SERVICE_NAME = 'whiteboard-demo-deployed'
const WHITEBOARD_NAME = `${SERVICE_NAME}/default`
const JAMSOCKET_API_TOKEN = process.env.JAMSOCKET_API_TOKEN ?? ''
const API_URL = IS_DEV ? 'http://localhost:8080' : undefined

if (!IS_DEV && !JAMSOCKET_API_TOKEN) {
  throw new Error(`Expected JAMSOCKET_API_TOKEN in environment`)
}

console.log('Using the following config:', { IS_DEV, ACCOUNT_NAME, SERVICE_NAME, API_URL })

const spawnBackend = init({
  account: ACCOUNT_NAME,
  service: SERVICE_NAME,
  token: JAMSOCKET_API_TOKEN,
  apiUrl: API_URL
})

export default async function Page() {
  const spawnResult = await spawnBackend({ lock: WHITEBOARD_NAME })
  console.log('spawned backend', spawnResult)
  return <HomeContainer spawnResult={spawnResult} />
}
