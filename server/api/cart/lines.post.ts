import { addLine } from '../../utils/cartStore'
interface Body { variantId?: string; quantity?: number }
export default defineEventHandler(async (event) => {
 const body=await readBody<Body>(event),variantId=String(body?.variantId??'').trim(),raw=Number(body?.quantity??1)
 if(!variantId)throw createError({statusCode:400,statusMessage:'variantId is required'})
 if(!Number.isFinite(raw)||!Number.isInteger(raw)||raw<1||raw>99)throw createError({statusCode:400,statusMessage:'quantity must be an integer between 1 and 99'})
 try{return {cart:await addLine(event,variantId,raw)}}catch(error){throw createError({statusCode:422,statusMessage:error instanceof Error?error.message:'Could not add item'})}
})
