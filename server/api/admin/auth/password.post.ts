import { signInWithPassword } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  return await signInWithPassword(event)
})
