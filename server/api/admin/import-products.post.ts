import { db, dbAsUser, supabaseConfig } from '../../utils/supabase'
import { authConfig, requireAdmin } from '../../utils/admin-auth'

type CsvRow = Record<string, string>

const CATEGORY_RULES: Array<{ prefix: string; type: string }> = [
  { prefix: 'SW', type: 'Coolant Temperature Sensor' },
  { prefix: 'WK', type: 'Temperature Control Switch' },
  { prefix: 'DCKG', type: 'Reverse Light Switch' },
  { prefix: 'DCF', type: 'Solenoid Valve' },
  { prefix: 'JY', type: 'Oil Pressure Alarm' },
  { prefix: 'TY', type: 'Tire Pressure Sensor' },
]

function parseCsv(input: string): CsvRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (char === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++ }
      else quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell); cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some(value => value.trim())) rows.push(row)
      row = []
    } else cell += char
  }
  row.push(cell)
  if (row.some(value => value.trim())) rows.push(row)
  if (rows.length < 2) return []
  const headers = rows.shift()!.map(value => value.trim().replace(/^\uFEFF/, '').toLowerCase())
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, (values[index] ?? '').trim()])))
}

function safeName(value: string) {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'product'
}

function productType(factoryNo: string) {
  const code = factoryNo.toUpperCase().replace(/^HD/, '')
  return CATEGORY_RULES.find(rule => code.startsWith(rule.prefix))?.type ?? ''
}

function parseImages(value: string): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.startsWith('https://')) : []
  } catch {
    return value.split(/[\s;]+/).filter(item => item.startsWith('https://'))
  }
}

async function storeImage(sourceUrl: string, factoryNo: string, index: number, baseUrl: string, publishableKey: string, storageToken: string) {
  const parsed = new URL(sourceUrl)
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'hd.muhz.net') throw new Error('Image URL host is not allowed')
  const response = await fetch(sourceUrl, { headers: { 'User-Agent': 'RoadReadyCatalogImporter/1.0' } })
  if (!response.ok) throw new Error(`Image source returned HTTP ${response.status}`)
  const mime = (response.headers.get('content-type') || '').split(';')[0]
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'image/gif' ? 'gif' : 'jpg'
  if (!mime.startsWith('image/')) throw new Error('Source did not return an image')
  const bytes = await response.arrayBuffer()
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error('Image exceeds 10 MB')
  const objectPath = `${safeName(factoryNo)}/${index + 1}-${safeName(parsed.pathname.split('/').pop() || 'photo') }.${ext}`
  const upload = await fetch(`${baseUrl}/storage/v1/object/product-images/${objectPath}`, {
    method: 'POST',
    headers: { apikey: publishableKey, Authorization: `Bearer ${storageToken}`, 'Content-Type': mime, 'x-upsert': 'true' },
    body: bytes,
  })
  if (!upload.ok) throw new Error(`Storage upload failed: ${(await upload.text()).slice(0, 160)}`)
  return { url: `${baseUrl}/storage/v1/object/public/product-images/${objectPath}`, altText: factoryNo, width: null, height: null }
}

export default defineEventHandler(async (event) => {
  const { accessToken } = await requireAdmin(event)
  const { url: baseUrl, key: publishableKey } = authConfig(event)
  const storageToken = accessToken || supabaseConfig(event).key
  const writeProducts = <T>(table: string, options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; query?: Record<string, string>; body?: unknown; prefer?: string } = {}) =>
    accessToken ? dbAsUser<T>(event, accessToken, table, options) : db<T>(event, table, options)

  const body = await readBody<{ csv?: string }>(event)
  if (!body?.csv || body.csv.length > 5_000_000) throw createError({ statusCode: 400, statusMessage: 'Please upload a CSV file under 5 MB.' })
  const rows = parseCsv(body.csv)
  if (!rows.length) throw createError({ statusCode: 400, statusMessage: 'No product rows were found in this CSV.' })

  const report: Array<{ factoryNo: string; status: string; message: string }> = []
  const seen = new Set<string>()
  let created = 0
  let updated = 0
  let imageCount = 0

  for (const row of rows.slice(0, 100)) {
    const factoryNo = row.factory_no || row.factoryno || ''
    const oem = row.oem || row.oe || ''
    const carModel = row.car_model || row.carmodel || ''
    if (!factoryNo || !oem) {
      report.push({ factoryNo: factoryNo || '(missing)', status: 'skipped', message: 'Missing factory_no or oem.' })
      continue
    }
    const identity = factoryNo.toUpperCase()
    if (seen.has(identity)) {
      report.push({ factoryNo, status: 'skipped', message: 'Duplicate factory number in this CSV.' })
      continue
    }
    seen.add(identity)
    const type = productType(factoryNo)
    if (!type) {
      report.push({ factoryNo, status: 'skipped', message: 'Factory number prefix is not mapped to one of the six product categories.' })
      continue
    }

    const imageUrls = parseImages(row.images || row.pic || row.image || '')
    const images: Array<{ url: string; altText: string; width: number | null; height: number | null }> = []
    const warnings: string[] = []
    for (const [index, imageUrl] of imageUrls.slice(0, 12).entries()) {
      try {
        const stored = await storeImage(imageUrl, factoryNo, index, baseUrl, publishableKey, storageToken)
        images.push(stored)
        imageCount++
      } catch (error) {
        warnings.push(`Image ${index + 1}: ${error instanceof Error ? error.message : 'upload failed'}`)
      }
    }
    if (!images.length && imageUrls.length) warnings.push('No images could be copied to Storage.')
    if (!imageUrls.length) warnings.push('No image URLs found in the images column.')

    const title = `${factoryNo} — ${type}`
    const description = [
      `Product category: ${type}.`,
      `Factory number: ${factoryNo}.`,
      `OE reference numbers: ${oem}.`,
      carModel ? `Vehicle applications: ${carModel}.` : '',
    ].filter(Boolean).join(' ')
    const payload = {
      title, description, description_html: description, product_type: type,
      vendor: 'RoadReady Auto', tags: [factoryNo, ...oem.split(/[\/;,]+/).map(value => value.trim()).filter(Boolean).slice(0, 12)],
      available_for_sale: true, featured_image: images[0] ?? null, images,
      landing_content: null, is_published: true, sort_order: 0,
      factory_no: factoryNo, car_model: carModel, oem,
    }

    try {
      const existing = await writeProducts<Array<{ id: string; handle: string }>>('products', {
        query: { select: 'id,handle', factory_no: `eq.${factoryNo}`, oem: `eq.${oem}`, limit: '3' },
      })
      if (existing.length > 1) {
        report.push({ factoryNo, status: 'skipped', message: 'More than one existing product has this factory number; manual review required.' })
        continue
      }
      if (existing.length === 1) {
        await writeProducts('products', { method: 'PATCH', query: { id: `eq.${existing[0].id}` }, body: payload, prefer: 'return=minimal' })
        updated++
        report.push({ factoryNo, status: 'updated', message: warnings.join(' ') || `Updated; ${images.length} images stored.` })
      } else {
        const handle = `part-${safeName(factoryNo).toLowerCase()}-${safeName(row.id || String(created + updated + 1)).toLowerCase()}`
        await writeProducts('products', { method: 'POST', body: { ...payload, handle }, prefer: 'return=minimal' })
        created++
        report.push({ factoryNo, status: 'created', message: warnings.join(' ') || `Created; ${images.length} images stored.` })
      }
    } catch (error) {
      report.push({ factoryNo, status: 'failed', message: error instanceof Error ? error.message.slice(0, 220) : 'Database write failed.' })
    }
  }

  if (rows.length > 100) report.push({ factoryNo: '(remaining rows)', status: 'skipped', message: 'Import limit is 100 products per batch. Upload the remaining rows as another CSV.' })
  return { success: true, total: rows.length, created, updated, imageCount, skipped: report.filter(item => item.status === 'skipped').length, failed: report.filter(item => item.status === 'failed').length, report }
})
