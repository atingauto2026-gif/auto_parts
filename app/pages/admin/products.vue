<script setup lang="ts">
type ProductImage = { url: string; altText?: string | null; width?: number | null; height?: number | null }
type AdminProduct = {
  id: string; handle: string; title: string; description: string; product_type: string;
  vendor: string; tags: string[]; featured_image: ProductImage | null; images: ProductImage[];
  is_published: boolean; factory_no: string | null; car_model: string | null; oem: string | null
}
const categories = [
  'Coolant Temperature Sensor',
  'Temperature Control Switch',
  'Reverse Light Switch',
  'Solenoid Valve',
  'Oil Pressure Alarm',
  'Tire Pressure Sensor',
]
const categoryPrefixes: Array<[string, string]> = [
  ['SW', categories[0]], ['WK', categories[1]], ['DCKG', categories[2]],
  ['DCF', categories[3]], ['JY', categories[4]], ['TY', categories[5]],
]
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const products = ref<AdminProduct[]>([])
const search = ref('')
const message = ref('')
const errorMessage = ref('')
const editingId = ref('')
const form = reactive({
  factory_no: '', title: '', product_type: '', oem: '', car_model: '',
  description: '', vendor: 'RoadReady Auto', is_published: true,
  images: [] as ProductImage[],
})
const detectedCategory = computed(() => {
  const code = form.factory_no.trim().toUpperCase().replace(/^HD/, '')
  return categoryPrefixes.find(([prefix]) => code.startsWith(prefix))?.[1] || ''
})
const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return products.value
  return products.value.filter(p => [p.factory_no, p.title, p.oem, p.car_model, p.product_type].join(' ').toLowerCase().includes(term))
})
const featuredImage = computed(() => form.images[0] ?? null)

async function loadProducts() {
  loading.value = true
  try {
    products.value = await $fetch<AdminProduct[]>('/api/admin/products')
  } catch (error: any) {
    if (error?.statusCode === 401 || error?.status === 401) await navigateTo('/admin/login')
    else errorMessage.value = error?.data?.statusMessage || 'Unable to load products.'
  } finally { loading.value = false }
}
function resetForm() {
  editingId.value = ''
  Object.assign(form, { factory_no: '', title: '', product_type: '', oem: '', car_model: '', description: '', vendor: 'RoadReady Auto', is_published: true, images: [] })
  message.value = ''
  errorMessage.value = ''
}
function editProduct(product: AdminProduct) {
  editingId.value = product.id
  Object.assign(form, {
    factory_no: product.factory_no || '',
    title: product.title || '',
    product_type: product.product_type || '',
    oem: product.oem || '',
    car_model: product.car_model || '',
    description: product.description || '',
    vendor: product.vendor || 'RoadReady Auto',
    is_published: product.is_published,
    images: [...(product.images?.length ? product.images : product.featured_image ? [product.featured_image] : [])],
  })
  message.value = ''
  errorMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
async function uploadImages(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  if (!files.length) return
  if (form.images.length + files.length > 12) {
    errorMessage.value = 'A product can have up to 12 images.'
    return
  }
  uploading.value = true
  errorMessage.value = ''
  try {
    for (const file of files) {
      const body = new FormData()
      body.append('file', file)
      body.append('factory_no', form.factory_no || 'new-product')
      body.append('category', form.product_type || detectedCategory.value || 'uncategorized')
      const result = await $fetch<{ image: ProductImage }>('/api/admin/products/upload', { method: 'POST', body })
      form.images.push(result.image)
    }
    message.value = `${files.length} image(s) uploaded to product storage.`
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.message || 'Image upload failed.'
  } finally { uploading.value = false }
}
function moveImage(index: number, direction: number) {
  const next = index + direction
  if (next < 0 || next >= form.images.length) return
  const copy = [...form.images]
  ;[copy[index], copy[next]] = [copy[next], copy[index]]
  form.images = copy
}
async function saveProduct() {
  if (saving.value || uploading.value) return
  if (!form.factory_no.trim() || !form.title.trim()) {
    errorMessage.value = 'Please enter the factory number and product name.'
    return
  }
  saving.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/products', {
      method: 'POST',
      body: {
        ...(editingId.value ? { id: editingId.value } : {}),
        ...form,
        product_type: form.product_type || detectedCategory.value,
        featured_image: featuredImage.value,
      },
    })
    message.value = editingId.value ? 'Product updated successfully.' : 'Product created successfully.'
    await loadProducts()
    resetForm()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.message || 'Unable to save product.'
  } finally { saving.value = false }
}
async function logout() {
  await $fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {})
  await navigateTo('/admin/login')
}
onMounted(async () => {
  try {
    await $fetch('/api/admin/auth/status')
    await loadProducts()
  } catch { await navigateTo('/admin/login') }
})
useSeoMeta({ title: 'Product Management' })
</script>

<template>
  <main class="admin-page">
    <div class="admin-shell">
      <header class="topbar">
        <NuxtLink to="/" class="brand">ROADREADY <span>AUTO</span></NuxtLink>
        <nav><NuxtLink to="/admin/import">CSV Import</NuxtLink><button @click="logout">Log out</button></nav>
      </header>
      <div class="page-heading">
        <div><p class="eyebrow">CATALOG MANAGEMENT</p><h1>Product manager</h1><p class="intro">Add a product, upload its photos, and publish its product detail page.</p></div>
        <button class="secondary" @click="resetForm">＋ New product</button>
      </div>

      <section class="editor panel">
        <div class="section-head"><div><p class="eyebrow">PRODUCT DETAILS</p><h2>{{ editingId ? 'Edit product' : 'Add a product' }}</h2></div><span class="step">01 / 02</span></div>
        <form @submit.prevent="saveProduct">
          <div class="form-grid">
            <label>Factory part number *<input v-model="form.factory_no" placeholder="e.g. HDSW11401" required><small v-if="detectedCategory" class="detected">Auto-detected: {{ detectedCategory }}</small></label>
            <label>Product name *<input v-model="form.title" placeholder="e.g. Coolant Temperature Sensor" required></label>
            <label>Product category<select v-model="form.product_type"><option value="">Auto-detect from part number</option><option v-for="category in categories" :key="category" :value="category">{{ category }}</option></select></label>
            <label>OE / OEM numbers<input v-model="form.oem" placeholder="Enter OE reference numbers"></label>
            <label class="wide">Vehicle applications<input v-model="form.car_model" placeholder="e.g. Toyota, Lexus, model and year"></label>
            <label class="wide">Product description<textarea v-model="form.description" rows="4" placeholder="Describe the product, materials, specifications and applications…"></textarea></label>
            <label>Brand / vendor<input v-model="form.vendor" placeholder="RoadReady Auto"></label>
            <label class="publish"><input v-model="form.is_published" type="checkbox"> Publish on Products page</label>
          </div>

          <div class="image-section">
            <div class="image-title"><div><h3>Product images</h3><p>JPG, PNG, WebP or GIF · Up to 10 MB each · Maximum 12 images</p></div><span>{{ form.images.length }} / 12</span></div>
            <label class="upload-box"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple :disabled="uploading || form.images.length >= 12" @change="uploadImages"><span class="upload-plus">＋</span><strong>{{ uploading ? 'Uploading images…' : 'Choose product photos' }}</strong><small>Images are saved to Supabase Storage automatically</small></label>
            <div v-if="form.images.length" class="image-grid">
              <figure v-for="(image, index) in form.images" :key="image.url">
                <img :src="image.url" :alt="image.altText || form.title">
                <figcaption><strong>{{ index === 0 ? 'Main image' : `Image ${index + 1}` }}</strong><span><button type="button" :disabled="index === 0" @click="moveImage(index, -1)">←</button><button type="button" :disabled="index === form.images.length - 1" @click="moveImage(index, 1)">→</button><button type="button" class="remove" @click="form.images.splice(index, 1)">Remove</button></span></figcaption>
              </figure>
            </div>
          </div>
          <div class="form-footer"><p v-if="message" class="success">{{ message }}</p><p v-if="errorMessage" class="error">{{ errorMessage }}</p><div class="actions"><button type="button" class="secondary" @click="resetForm">Clear</button><button type="submit" class="primary" :disabled="saving || uploading">{{ saving ? 'Saving…' : editingId ? 'Save changes' : 'Create product' }}</button></div></div>
        </form>
      </section>

      <section class="list-section panel">
        <div class="section-head"><div><p class="eyebrow">YOUR CATALOG</p><h2>Products <span class="total">{{ products.length }}</span></h2></div><input v-model="search" class="search" placeholder="Search part number, OE, model…"></div>
        <p v-if="loading" class="empty">Loading products…</p>
        <div v-else-if="filteredProducts.length" class="product-list">
          <article v-for="product in filteredProducts" :key="product.id" class="product-row">
            <img :src="product.featured_image?.url || product.images?.[0]?.url || ''" :alt="product.title" class="thumb">
            <div class="product-copy"><strong>{{ product.title }}</strong><span>{{ product.factory_no }} · {{ product.product_type }}</span><small>OE: {{ product.oem || '—' }} · {{ product.images?.length || 0 }} images</small></div>
            <span :class="['status', product.is_published ? 'live' : 'draft']">{{ product.is_published ? 'Published' : 'Draft' }}</span>
            <NuxtLink :to="`/products/${product.handle}`" target="_blank" class="view-link">View ↗</NuxtLink>
            <button class="edit-button" @click="editProduct(product)">Edit</button>
          </article>
        </div>
        <p v-else class="empty">No products found. Create your first product above.</p>
      </section>
      <footer><NuxtLink to="/products">View public Products page ↗</NuxtLink><span>RoadReady Auto · Admin</span></footer>
    </div>
  </main>
</template>

<style scoped>
.admin-page{min-height:100vh;background:#f1f3f4;color:#17212a;padding:28px 22px 70px;font-family:Barlow,Arial,sans-serif}.admin-shell{max-width:1160px;margin:auto}.topbar,.topbar nav,.page-heading,.section-head,.image-title,.form-footer,.actions,footer{display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-weight:800;letter-spacing:.08em;color:#17212a;text-decoration:none}.brand span{color:#d97732}.topbar nav{font-size:13px}.topbar nav a,footer a{color:#69747d;text-decoration:none}.topbar nav button,.edit-button,.view-link{border:0;background:none;color:#d16b2d;cursor:pointer;font:inherit}.page-heading{margin:48px 0 24px;align-items:flex-end}.eyebrow{color:#d97732;font-size:10px;font-weight:800;letter-spacing:.17em;margin:0 0 7px}.page-heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.intro{color:#6c7780;margin:8px 0 0}.panel{background:white;border:1px solid #e0e4e7;border-radius:12px;padding:26px;margin:18px 0}.section-head{margin-bottom:22px}.section-head h2{font-size:21px;margin:0}.step,.total{font-size:12px;color:#7b858d;background:#f1f3f4;padding:6px 10px;border-radius:20px}.secondary{border:1px solid #d8dde1;background:white;color:#35414a;padding:11px 16px;border-radius:7px;cursor:pointer}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:17px}.form-grid label{display:grid;gap:7px;font-size:12px;font-weight:700;color:#4d5962}.form-grid input:not([type=checkbox]),.form-grid select,.form-grid textarea,.search{width:100%;box-sizing:border-box;border:1px solid #dce1e4;border-radius:7px;padding:12px;font:400 14px Barlow,Arial;background:#fff;color:#17212a;outline:none}.form-grid input:focus,.form-grid textarea:focus,.form-grid select:focus{border-color:#d97732;box-shadow:0 0 0 3px #d977321c}.form-grid .wide{grid-column:1/-1}.form-grid small{font-weight:400;color:#2e8155}.publish{display:flex!important;align-items:center;gap:9px!important}.publish input{accent-color:#d97732;width:16px;height:16px}.image-section{border-top:1px solid #edf0f2;margin-top:26px;padding-top:24px}.image-title h3{font-size:17px;margin:0 0 4px}.image-title p,.image-title>span{font-size:12px;color:#7b858d;margin:0}.upload-box{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:26px;border:1px dashed #c5cdd2;border-radius:9px;background:#fafbfc;cursor:pointer;margin-top:16px;color:#39454e}.upload-box input{display:none}.upload-box small{font-size:11px;color:#849099;font-weight:400}.upload-plus{font-size:25px;color:#d97732}.image-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:12px;margin-top:16px}.image-grid figure{margin:0;border:1px solid #e4e8ea;border-radius:8px;overflow:hidden}.image-grid img{width:100%;height:120px;object-fit:contain;background:#f6f7f8}.image-grid figcaption{padding:8px;display:flex;align-items:center;justify-content:space-between;gap:5px;font-size:11px}.image-grid figcaption span{display:flex;gap:4px}.image-grid button{border:1px solid #e0e4e7;background:white;border-radius:4px;padding:3px 5px;cursor:pointer;font-size:10px}.image-grid button:disabled{opacity:.3}.image-grid .remove{color:#b54b3b}.form-footer{border-top:1px solid #edf0f2;margin-top:24px;padding-top:18px;flex-wrap:wrap}.success,.error{font-size:13px;margin:0}.success{color:#2c8054}.error{color:#b33d2e}.actions{margin-left:auto}.primary{background:#d97732;color:#fff;border:0;padding:12px 20px;border-radius:7px;font-weight:700;cursor:pointer}.primary:disabled{opacity:.5;cursor:wait}.list-section{margin-top:28px}.search{max-width:310px}.product-list{display:grid}.product-row{display:flex;align-items:center;gap:14px;padding:13px 0;border-top:1px solid #edf0f2}.thumb{width:58px;height:58px;object-fit:contain;background:#f4f5f6;border-radius:6px}.product-copy{display:grid;gap:3px;flex:1;min-width:0}.product-copy strong{font-size:14px}.product-copy span,.product-copy small{font-size:11px;color:#75818a}.status{font-size:10px;padding:5px 8px;border-radius:20px}.live{background:#eaf5ee;color:#32764c}.draft{background:#f1f2f3;color:#727d85}.empty{padding:22px 0;color:#7b858d;font-size:13px}footer{margin-top:24px;color:#8a949b;font-size:12px}@media(max-width:700px){.admin-page{padding:18px 12px 50px}.panel{padding:17px}.page-heading{align-items:flex-start;flex-direction:column}.page-heading h1{font-size:31px}.form-grid{grid-template-columns:1fr}.form-grid .wide{grid-column:auto}.section-head{align-items:flex-start;flex-direction:column}.search{max-width:none}.product-row{flex-wrap:wrap}.product-copy{min-width:calc(100% - 80px)}.status{margin-left:72px}.image-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
