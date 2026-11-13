import type { Cart, CartLine, Money, ShopImage } from '#shared/types'
import type { H3Event } from 'h3'
import { db } from './supabase'
const CART_COOKIE='roadready_cart',COOKIE_MAX_AGE=60*60*24*30
interface CartRow{id:string;currency_code:string}
interface ItemRow{id:string;quantity:number;variant:{id:string;title:string;price:string;currency_code:string;image:ShopImage|null;product:{title:string;handle:string}}}
const money=(amount:number,currencyCode:string):Money=>({amount:amount.toFixed(2),currencyCode})
export function readCartId(event:H3Event):string|null{return getCookie(event,CART_COOKIE)??null}
function writeCartId(event:H3Event,id:string){setCookie(event,CART_COOKIE,id,{httpOnly:true,sameSite:'lax',secure:!import.meta.dev,path:'/',maxAge:COOKIE_MAX_AGE})}
function clearCartId(event:H3Event){deleteCookie(event,CART_COOKIE,{path:'/'})}
async function loadCart(event:H3Event,id:string):Promise<Cart|null>{
 const carts=await db<CartRow[]>(event,'carts',{query:{select:'id,currency_code',id:`eq.${id}`,expires_at:`gt.${new Date().toISOString()}`,limit:'1'}})
 const row=carts[0];if(!row)return null
 const items=await db<ItemRow[]>(event,'cart_items',{query:{select:'id,quantity,variant:product_variants(id,title,price,currency_code,image,product:products(title,handle))',cart_id:`eq.${id}`,order:'created_at.asc'}})
 const lines:CartLine[]=items.map(item=>({id:item.id,quantity:item.quantity,merchandise:{id:`gid://supabase/ProductVariant/${item.variant.id}`,title:item.variant.title,price:money(Number(item.variant.price),item.variant.currency_code),image:item.variant.image,productTitle:item.variant.product.title,productHandle:item.variant.product.handle}}))
 const subtotal=lines.reduce((sum,line)=>sum+Number(line.merchandise.price.amount)*line.quantity,0)
 return {id:row.id,checkoutUrl:'',totalQuantity:lines.reduce((sum,line)=>sum+line.quantity,0),subtotal:money(subtotal,row.currency_code),total:money(subtotal,row.currency_code),lines}
}
async function requireCart(event:H3Event):Promise<Cart>{
 const current=await getCart(event);if(current)return current
 const rows=await db<CartRow[]>(event,'carts',{method:'POST',query:{select:'id,currency_code'},body:{currency_code:'AUD'},prefer:'return=representation'})
 if(!rows[0])throw new Error('Could not create cart')
 writeCartId(event,rows[0].id)
 return {id:rows[0].id,checkoutUrl:'',totalQuantity:0,subtotal:money(0,rows[0].currency_code),total:money(0,rows[0].currency_code),lines:[]}
}
export async function getCart(event:H3Event):Promise<Cart|null>{const id=readCartId(event);if(!id)return null;const cart=await loadCart(event,id);if(!cart)clearCartId(event);return cart}
function rawVariantId(value:string):string{const id=value.split('/').at(-1)??value;if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error('Invalid product variant');return id}
export async function addLine(event:H3Event,variantId:string,quantity:number):Promise<Cart>{
 if(!Number.isInteger(quantity)||quantity<1||quantity>99)throw new Error('Quantity must be between 1 and 99')
 const cart=await requireCart(event),id=rawVariantId(variantId)
 const variants=await db<{id:string;available_for_sale:boolean}[]>(event,'product_variants',{query:{select:'id,available_for_sale',id:`eq.${id}`,limit:'1'}})
 if(!variants[0]||!variants[0].available_for_sale)throw new Error('This product is unavailable')
 const existing=await db<{id:string;quantity:number}[]>(event,'cart_items',{query:{select:'id,quantity',cart_id:`eq.${cart.id}`,variant_id:`eq.${id}`,limit:'1'}})
 if(existing[0])await db(event,'cart_items',{method:'PATCH',query:{id:`eq.${existing[0].id}`},body:{quantity:Math.min(99,existing[0].quantity+quantity),updated_at:new Date().toISOString()},prefer:'return=minimal'})
 else await db(event,'cart_items',{method:'POST',body:{cart_id:cart.id,variant_id:id,quantity},prefer:'return=minimal'})
 return (await loadCart(event,cart.id))!
}
export async function changeLine(event:H3Event,lineId:string,quantity:number):Promise<Cart>{
 const cart=await requireCart(event),query={id:`eq.${lineId}`,cart_id:`eq.${cart.id}`}
 if(quantity<=0)await db(event,'cart_items',{method:'DELETE',query,prefer:'return=minimal'})
 else await db(event,'cart_items',{method:'PATCH',query,body:{quantity:Math.min(99,quantity),updated_at:new Date().toISOString()},prefer:'return=minimal'})
 return (await loadCart(event,cart.id))!
}
export async function deleteLine(event:H3Event,lineId:string):Promise<Cart>{return changeLine(event,lineId,0)}
