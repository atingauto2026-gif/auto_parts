import { requireAdmin } from '../../../utils/admin-auth'
import { supabaseConfig } from '../../../utils/supabase'

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function safePath(value: string) {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'product'
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file' && part.data)
  const factoryNo = parts?.find(part => part.name === 'factory_no')?.data.toString('utf8') || 'unassigned'
  const category = parts?.find(part => part.name === 'category')?.data.toString('utf8') || 'uncategorized'
  if (!file?.data) throw createError({ statusCode: 400, statusMessage: 'Please choose an image file.' })
  const mime = file.type || ''
  const extension = ALLOWED[mime]
  if (!extension) throw createError({ statusCode: 415, statusMessage: 'Only JPG, PNG, WebP and GIF images are supported.' })
  if (file.data.byteLength > 10 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'Each image must be 10 MB or smaller.' })
  const { url, key } = supabaseConfig(event)
  const objectPath = `${safePath(category)}/${safePath(factoryNo)}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`
  const response = await fetch(`${url}/storage/v1/object/product-images/${objectPath.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': mime,
      'x-upsert': 'false',
    },
    body: file.data,
  })
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 180)
    throw createError({ statusCode: 502, statusMessage: `Image upload failed: ${detail}` })
  }
  const image = {
    url: `${url}/storage/v1/object/public/product-images/${objectPath.split('/').map(encodeURIComponent).join('/')}`,
    altText: factoryNo,
    width: null,
    height: null,
  }
  return { success: true, image, path: objectPath }
})
