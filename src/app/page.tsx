import 'server-only';
import HomeContainer from '../components/Home'
import { init } from '@jamsocket/javascript/server'

const ACCOUNT_NAME = 'taylor'
const SERVICE_NAME = 'whiteboard-demo-deployed'
const WHITEBOARD_NAME = `${SERVICE_NAME}/default`
const JAMSOCKET_API_TOKEN = process.env.JAMSOCKET_API_TOKEN

if (typeof JAMSOCKET_API_TOKEN !== 'string') {
  throw new Error(`Expected JAMSOCKET_API_TOKEN in environment`)
}

const spawnBackend = init({
  account: ACCOUNT_NAME,
  service: SERVICE_NAME,
  token: JAMSOCKET_API_TOKEN
})

export default async function Page() {
  const spawnResult = await spawnBackend({ lock: WHITEBOARD_NAME })
  return <HomeContainer spawnResult={spawnResult} />
}
