import { getProductDetail } from '../../utils/catalogService'
export default defineEventHandler(async(event)=>{const handle=getRouterParam(event,'handle');if(!handle)throw createError({statusCode:400,statusMessage:'Missing product handle'});const detail=await getProductDetail(event,handle);if(!detail)throw createError({statusCode:404,statusMessage:'Product not found'});return detail})
