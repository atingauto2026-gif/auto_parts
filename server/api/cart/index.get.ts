import { getCart } from '../../utils/cartStore'
export default defineEventHandler(async(event)=>({cart:await getCart(event),checkoutEnabled:false}))
