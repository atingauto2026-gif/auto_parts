import { listProducts } from '../../utils/catalogService'
export default defineEventHandler(async(event)=>await listProducts(event))
