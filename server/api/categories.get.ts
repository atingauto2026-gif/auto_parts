import { listCategories } from '../utils/catalogService'
export default defineEventHandler(async(event)=>({categories:await listCategories(event),storefrontConfigured:true}))
