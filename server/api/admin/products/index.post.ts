import { db } from '../../../utils/supabase'
import { requireAdmin } from '../../../utils/admin-auth'

const CATEGORY_RULES = [
  { prefix: 'SW', type: 'Coolant Temperature Sensor' },
  { prefix: 'WK', type: 'Temperature Control Switch' },
  { prefix: 'DCKG', type: 'Reverse Light Switch' },
  { prefix: 'DCF', type: 'Solenoid Valve' },
  { prefix: 'JY', type: 'Oil Pressure Alarm' },
  { prefix: 'TY', type: 'Tire Pressure Sensor' },
]

function safePart(value: string) {
  return value.trim().toUpperCase().replace(/^HD/, '').replace(/[^A-Z0-9_-]/g, '')
}
function slug(value: string) {
  return value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, any>>(event)
  const factoryNo = String(body?.factory_no ?? '').trim()
  const title = String(body?.title ?? '').trim()
  const oem = String(body?.oem ?? '').trim()
  const carModel = String(body?.car_model ?? '').trim()
  const description = String(body?.description ?? '').trim()
  if (!factoryNo || !title) throw createError({ statusCode: 400, statusMessage: 'Factory number and product name are required.' })
  if (factoryNo.length > 100 || title.length > 180 || oem.length > 2000 || carModel.length > 2000 || description.length > 12000) {
    throw createError({ statusCode: 400, statusMessage: 'One or more fields exceed the allowed length.' })
  }
  const detected = CATEGORY_RULES.find(rule => safePart(factoryNo).startsWith(rule.prefix))?.type
  const productType = String(body.product_type || detected || '').trim()
  if (!productType) throw createError({ statusCode: 400, statusMessage: 'Could not identify this product category. Please select one manually.' })
  const images = Array.isArray(body.images) ? body.images.slice(0, 12) : []
  const featuredImage = body.featured_image && typeof body.featured_image.url === 'string' ? body.featured_image : images[0] ?? null
  const tags = [...new Set([factoryNo, ...oem.split(/[\\/;,]+/).map(v => v.trim()).filter(Boolean)])].slice(0, 30)
  const payload = {
    title,
    description,
    description_html: description,
    product_type: productType,
    vendor: String(body.vendor || 'RoadReady Auto').slice(0, 120),
    tags,
    available_for_sale: true,
    featured_image: featuredImage,
    images,
    landing_content: null,
    is_published: body.is_published !== false,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    factory_no: factoryNo,
    car_model: carModel,
    oem,
    updated_at: new Date().toISOString(),
  }
  const id = String(body.id || '')
  if (id) {
    const updated = await db<Array<{ id: string; handle: string }>>(event, 'products', {
      method: 'PATCH',
      query: { id: `eq.${id}`, select: 'id,handle' },
      body: payload,
      prefer: 'return=representation',
    })
    if (!updated.length) throw createError({ statusCode: 404, statusMessage: 'Product not found.' })
    return { success: true, product: updated[0] }
  }
  const existing = await db<Array<{ id: string; handle: string }>>(event, 'products', {
    query: { select: 'id,handle', factory_no: `eq.${factoryNo}`, limit: '2' },
  })
  if (existing.length) throw createError({ statusCode: 409, statusMessage: 'This factory number already exists. Open the existing product to edit it.' })
  const baseHandle = `part-${slug(factoryNo)}`
  const handle = baseHandle || `part-${crypto.randomUUID().slice(0, 8)}`
  const inserted = await db<Array<{ id: string; handle: string }>>(event, 'products', {
    method: 'POST',
    query: { select: 'id,handle' },
    body: { ...payload, handle },
    prefer: 'return=representation',
  })
  return { success: true, product: inserted[0] }
})
