<script setup lang="ts">
type PreviewRow = { factoryNo: string; oem: string; carModel: string; imageCount: number; category: string }

useSeoMeta({ title: 'Product Import' })

const token = ref('')
const csvText = ref('')
const fileName = ref('')
const importing = ref(false)
const result = ref<any>(null)
const errorMessage = ref('')

function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < input.length; i++) {
    const c = input[i]
    if (c === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++ }
      else quoted = !quoted
    } else if (c === ',' && !quoted) { row.push(cell); cell = '' }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && input[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some(v => v.trim())) rows.push(row)
      row = []
    } else cell += c
  }
  row.push(cell)
  if (row.some(v => v.trim())) rows.push(row)
  return rows
}

const preview = computed<PreviewRow[]>(() => {
  const parsed = parseCsv(csvText.value)
  if (parsed.length < 2) return []
  const headers = parsed[0].map(v => v.trim().replace(/^\uFEFF/, '').toLowerCase())
  return parsed.slice(1).map(values => {
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
    let imageCount = 0
    try { imageCount = Array.isArray(JSON.parse(row.images || row.pic || '[]')) ? JSON.parse(row.images || row.pic || '[]').length : 0 } catch {}
    const factoryNo = row.factory_no || row.factoryno || ''
    const code = factoryNo.toUpperCase().replace(/^HD/, '')
    const match = [
      ['SW', 'Coolant Temperature Sensor'], ['WK', 'Temperature Control Switch'],
      ['DCKG', 'Reverse Light Switch'], ['DCF', 'Solenoid Valve'],
      ['JY', 'Oil Pressure Alarm'], ['TY', 'Tire Pressure Sensor'],
    ].find(([prefix]) => code.startsWith(prefix))
    return { factoryNo, oem: row.oem || row.oe || '', carModel: row.car_model || row.carmodel || '', imageCount, category: match?.[1] ?? 'Unmapped' }
  })
})

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  errorMessage.value = ''
  result.value = null
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errorMessage.value = 'Please choose a CSV file.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'CSV must be smaller than 5 MB.'
    return
  }
  fileName.value = file.name
  csvText.value = await file.text()
}

async function runImport() {
  if (!token.value.trim() || !csvText.value || importing.value) return
  importing.value = true
  result.value = null
  errorMessage.value = ''
  try {
    result.value = await $fetch('/api/admin/import-products', {
      method: 'POST',
      headers: { 'x-product-import-token': token.value },
      body: { csv: csvText.value },
    })
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.message || 'Import failed. Please try again.'
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <main class="import-page">
    <div class="import-shell">
      <NuxtLink to="/" class="back-link">← RoadReady Auto</NuxtLink>
      <p class="eyebrow">CATALOG MANAGEMENT</p>
      <h1>批量导入产品</h1>
      <p class="intro">上传产品 CSV，系统会按厂号识别六个产品分类，并根据 OE 数据表中的图片链接自动保存图片。导入前先检查预览。</p>

      <section class="panel">
        <label for="import-token">后台导入密钥</label>
        <input id="import-token" v-model="token" type="password" autocomplete="off" placeholder="输入 Cloudflare 中设置的 PRODUCT_IMPORT_TOKEN">
        <p class="hint">密钥只用于本次导入请求，不会保存到浏览器。</p>
      </section>

      <section class="panel">
        <label for="csv-file">第一步：选择产品 CSV</label>
        <input id="csv-file" type="file" accept=".csv,text/csv" @change="onFileChange">
        <p class="hint">{{ fileName || '支持 UTF-8 CSV，最大 5 MB。图片链接放在 images 列（JSON 数组）。' }}</p>
      </section>

      <section v-if="preview.length" class="panel">
        <div class="preview-head">
          <div>
            <h2>第二步：检查导入预览</h2>
            <p class="hint">共 {{ preview.length }} 条记录，单批最多导入 100 条。</p>
          </div>
          <span class="count">{{ preview.length }} 条</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>厂号</th><th>OE 号</th><th>车型</th><th>分类</th><th>图片</th></tr></thead>
            <tbody>
              <tr v-for="(item, index) in preview.slice(0, 30)" :key="index">
                <td>{{ item.factoryNo || '缺少厂号' }}</td>
                <td class="oe">{{ item.oem || '缺少 OE' }}</td>
                <td>{{ item.carModel || '—' }}</td>
                <td><span :class="['category', { unmapped: item.category === 'Unmapped' }]">{{ item.category }}</span></td>
                <td>{{ item.imageCount }} 张</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="preview.length > 30" class="hint">这里只显示前 30 条，其余记录也会一并检查和导入。</p>
        <button class="import-button" :disabled="!token.trim() || importing" @click="runImport">
          {{ importing ? '正在导入产品和图片…' : '确认并开始导入' }}
        </button>
      </section>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <section v-if="result" class="panel report">
        <h2>导入结果</h2>
        <div class="stats">
          <div><strong>{{ result.created }}</strong><span>新增</span></div>
          <div><strong>{{ result.updated }}</strong><span>更新</span></div>
          <div><strong>{{ result.imageCount }}</strong><span>已保存图片</span></div>
          <div><strong>{{ result.skipped + result.failed }}</strong><span>需处理</span></div>
        </div>
        <div class="report-list">
          <div v-for="(item, index) in result.report" :key="index" class="report-row">
            <strong>{{ item.factoryNo }}</strong>
            <span :class="item.status">{{ item.status === 'created' ? '新增成功' : item.status === 'updated' ? '更新成功' : item.status === 'skipped' ? '已跳过' : '失败' }}</span>
            <p>{{ item.message }}</p>
          </div>
        </div>
      </section>

      <section class="note">
        <strong>自动处理规则</strong>
        <ul>
          <li>以厂号作为产品更新匹配依据；相同厂号会更新，不重复新建。</li>
          <li>图片从 CSV 的 images 列读取，上传到 Supabase Storage。</li>
          <li>只自动识别 SW、WK、DCKG、DCF、JY、TY 六类厂号前缀。</li>
          <li>图片来源目前限定为 hd.muhz.net；无法下载的图片会在结果中说明。</li>
        </ul>
      </section>
    </div>
  </main>
</template>

<style scoped>
.import-page{min-height:100vh;background:#f3f4f5;color:#20262d;padding:48px 20px 80px;font-family:Arial,sans-serif}
.import-shell{max-width:980px;margin:0 auto}.back-link{color:#68727c;text-decoration:none;font-size:13px}.eyebrow{margin:34px 0 8px;color:#d66b2d;font-size:11px;font-weight:700;letter-spacing:.16em}
h1{font-size:34px;letter-spacing:-.04em;margin:0 0 12px}.intro{max-width:720px;color:#65707a;line-height:1.7;margin:0 0 28px}
.panel{background:#fff;border:1px solid #e0e4e7;border-radius:12px;padding:22px;margin:16px 0}
label{display:block;font-weight:700;font-size:14px;margin-bottom:10px}input[type=password]{width:100%;max-width:480px;padding:12px;border:1px solid #cfd5da;border-radius:7px;font-size:14px}
input[type=file]{display:block;max-width:100%;padding:12px;border:1px dashed #b9c1c8;border-radius:8px;background:#fafbfc;width:100%;box-sizing:border-box}
.hint{font-size:12px;color:#7b858e;margin:9px 0 0}.preview-head{display:flex;justify-content:space-between;align-items:center}h2{font-size:18px;margin:0 0 6px}.count{background:#eef1f3;padding:6px 10px;border-radius:20px;font-size:12px}
.table-wrap{overflow:auto;margin-top:16px}table{width:100%;border-collapse:collapse;font-size:12px;min-width:680px}th,td{text-align:left;padding:11px 9px;border-bottom:1px solid #edf0f2;vertical-align:top}th{color:#6c7680;font-weight:600;background:#fafbfc}.oe{max-width:280px;overflow-wrap:anywhere}.category{display:inline-block;background:#edf4ef;color:#386448;border-radius:4px;padding:3px 6px}.category.unmapped{background:#fff0e8;color:#a94b21}
.import-button{margin-top:20px;background:#d76d32;color:white;border:0;border-radius:7px;padding:13px 20px;font-weight:700;cursor:pointer}.import-button:disabled{opacity:.5;cursor:not-allowed}
.error{background:#fff0ed;color:#a43d28;padding:13px;border-radius:8px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.stats div{background:#f5f6f7;padding:14px;border-radius:8px}.stats strong{display:block;font-size:24px}.stats span{font-size:12px;color:#68727c}.report-list{max-height:420px;overflow:auto}.report-row{padding:12px 0;border-top:1px solid #edf0f2}.report-row strong{margin-right:10px}.report-row span{font-size:12px;font-weight:700}.report-row p{font-size:12px;color:#69737d;margin:6px 0 0}.created,.updated{color:#2e7650}.skipped{color:#a66a20}.failed{color:#b73b2b}
.note{margin-top:22px;padding:18px 20px;background:#e9ecee;border-radius:10px;color:#5d6871;font-size:12px;line-height:1.8}.note strong{color:#313a42}.note ul{padding-left:18px;margin-bottom:0}
@media(max-width:640px){.import-page{padding:28px 14px 50px}h1{font-size:28px}.panel{padding:16px}.stats{grid-template-columns:repeat(2,1fr)}}
</style>
