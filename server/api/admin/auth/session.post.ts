import { acceptAdminSession } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  return await acceptAdminSession(event)
})
