import { changeLine } from '../../utils/cartStore'
interface Body { lineId?: string; quantity?: number }
export default defineEventHandler(async (event) => {
 const body=await readBody<Body>(event),lineId=String(body?.lineId??'').trim(),raw=Number(body?.quantity??0)
 if(!lineId)throw createError({statusCode:400,statusMessage:'lineId is required'})
 if(!Number.isFinite(raw)||!Number.isInteger(raw)||raw<0||raw>99)throw createError({statusCode:400,statusMessage:'quantity must be an integer between 0 and 99'})
 try{return {cart:await changeLine(event,lineId,raw)}}catch(error){throw createError({statusCode:422,statusMessage:error instanceof Error?error.message:'Could not update item'})}
})
