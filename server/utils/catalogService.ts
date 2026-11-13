import type { CatalogCategory, LandingContent, Money, ShopImage, ShopProduct, ShopVariant } from '#shared/types'
import type { H3Event } from 'h3'
import { fallbackLanding, withDedicatedDefaults } from '../data/catalog'
import { db } from './supabase'
interface DbVariant { id:string; sku:string|null; title:string; price:string; compare_at_price:string|null; currency_code:string; available_for_sale:boolean; inventory_quantity:number|null; selected_options:{name:string;value:string}[]; image:ShopImage|null }
interface DbProduct { id:string; handle:string; title:string; description:string; description_html:string; product_type:string; vendor:string; tags:string[]; available_for_sale:boolean; featured_image:ShopImage|null; images:ShopImage[]; landing_content:LandingContent|null; product_variants?:DbVariant[] }
const gid=(type:string,id:string)=>`gid://supabase/${type}/${id}`
const money=(amount:string|number,currencyCode:string):Money=>({amount:Number(amount).toFixed(2),currencyCode})
function mapProduct(row:DbProduct):ShopProduct {
 const variants:ShopVariant[]=(row.product_variants??[]).map(v=>({id:gid('ProductVariant',v.id),title:v.title,availableForSale:v.available_for_sale,quantityAvailable:v.inventory_quantity,price:money(v.price,v.currency_code),compareAtPrice:v.compare_at_price==null?null:money(v.compare_at_price,v.currency_code),selectedOptions:v.selected_options??[],image:v.image}))
 const prices=variants.map(v=>Number(v.price?.amount??0)), currency=variants[0]?.price?.currencyCode??'AUD'
 return {id:gid('Product',row.id),handle:row.handle,title:row.title,description:row.description,descriptionHtml:row.description_html,productType:row.product_type,vendor:row.vendor,tags:row.tags??[],availableForSale:row.available_for_sale,featuredImage:row.featured_image,images:row.images??[],priceRange:variants.length?{minVariantPrice:money(Math.min(...prices),currency),maxVariantPrice:money(Math.max(...prices),currency)}:null,compareAtPrice:variants.map(v=>v.compareAtPrice).find(Boolean)??null,variants}
}
function landingFromProduct(product:ShopProduct,stored:LandingContent|null):LandingContent {
 if(stored)return withDedicatedDefaults(stored,product.featuredImage?.url??'')
 const local=fallbackLanding(product.handle); if(local)return local
 const text=product.description.split(/(?<=[.!?])\\s+/).filter(Boolean)
 return withDedicatedDefaults({code:product.title.split(/[—–|-]/)[0]?.trim()??product.title,name:product.title.split(/[—–|-]/).slice(1).join(' ').trim()||product.productType,category:product.productType.toLowerCase().replace(/[^a-z0-9]+/g,'-'),categoryLabel:product.productType||'Product',tagline:text[0]??product.title,lead:text.slice(0,2).join(' '),badges:product.tags.slice(0,6),stats:[],highlights:[],why:text.slice(1,7),features:[],metric:null,dataRows:[],gallery:[],safety:[],compare:null,scenarios:[],specs:[],kit:[],video:null,heroImage:product.featuredImage?.url??null,galleryImages:product.images.map(i=>i.url)},product.featuredImage?.url??'')
}
export async function listProducts(event:H3Event):Promise<{source:'supabase';products:ShopProduct[]}> {
 const rows=await db<DbProduct[]>(event,'products',{query:{select:'*,product_variants(*)',is_published:'eq.true',order:'sort_order.asc,title.asc'}})
 return {source:'supabase',products:rows.map(mapProduct)}
}
export async function getProductDetail(event:H3Event,handle:string):Promise<{source:'supabase';product:ShopProduct;landing:LandingContent}|null>{
 const rows=await db<DbProduct[]>(event,'products',{query:{select:'*,product_variants(*)',handle:`eq.${handle}`,is_published:'eq.true',limit:'1'}})
 const row=rows[0];if(!row)return null
 const product=mapProduct(row);return {source:'supabase',product,landing:landingFromProduct(product,row.landing_content)}
}
export async function listCategories(event:H3Event):Promise<CatalogCategory[]>{
 return await db<CatalogCategory[]>(event,'categories',{query:{select:'id,label,blurb,image',is_active:'eq.true',order:'sort_order.asc'}})
}