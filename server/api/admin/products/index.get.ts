import { db } from '../../../utils/supabase'
import { requireAdmin } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await db<Array<Record<string, unknown>>>(event, 'products', {
    query: {
      select: 'id,handle,title,description,product_type,vendor,tags,featured_image,images,is_published,factory_no,car_model,oem,updated_at',
      order: 'updated_at.desc',
      limit: '300',
    },
  })
})
