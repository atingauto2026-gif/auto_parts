import { sendAdminMagicLink } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  return await sendAdminMagicLink(event)
})
