import { listProducts } from '../../utils/catalogService'

export default defineEventHandler(async () => {
  return await listProducts()
})
