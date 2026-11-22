export default defineNuxtConfig({
 compatibilityDate:'2025-07-15',devtools:{enabled:false},css:['~/assets/css/tokens.css','~/assets/css/base.css','~/assets/css/inner.css','~/assets/css/landing.css','~/assets/css/dedicated.css','~/assets/css/drawer.css','~/assets/css/antd-overrides.css'],
 // ---------------------------------------------------------------------------
 // Site configuration — SINGLE source of truth for company identity.
 //
 // STATUS 2026-11-22: real contact details + company identity are filled in.
 // Still intentionally EMPTY — do not guess, buyers verify these:
 //   - trade.*  MOQ / lead time / Incoterms / payment / warranty / samples
 //   - company.registrationNo, company.vatId  (from the business licence)
 //   - siteUrl  (update once a custom domain is attached)
 //
 // foundedYear is deliberately empty: 1999 is the founding year of the partner
 // FACTORY, not of this trading company. It is published separately as
 // "Manufacturing partner since" so the site never implies a false company
 // age, and Organization JSON-LD emits no foundingDate.
 //
 // legalName below is a standard Pinyin rendering — CONFIRM it matches the
 // English name on the business licence / bank account / export documents.
 //
 // Runtime override (no rebuild needed): set Cloudflare Pages env vars
 // NUXT_PUBLIC_EMAIL, NUXT_PUBLIC_PHONE, NUXT_PUBLIC_WHATSAPP,
 // NUXT_PUBLIC_COMPANY_LEGALNAME, NUXT_PUBLIC_COMPANY_ADDRESSLINE, ...
 // and redeploy. Env vars win over the values below.
 //
 // NEVER put placeholder text like "hello@example.com" in these fields.
 // Empty = the block simply does not render. Fake data = lost buyer trust.
 // ---------------------------------------------------------------------------
 runtimeConfig:{
  supabaseUrl:'',supabaseSecretKey:'',
  public:{
   siteUrl:'https://roadready-auto.pages.dev', // update when the custom domain is attached
   storeDomain:'',whatsapp:'8618758480610',email:'atingauto2026@gmail.com',phone:'+8618758480610',gtmId:'',
   company:{ // legal identity — shown on About, Imprint, footer and structured data
    legalName:'Wenzhou Hongzhen Auto Parts Co., Ltd.',
    addressLine:"Bashui Industrial Zone, Tangxia Town, Rui'an, Wenzhou, Zhejiang, P.R. China",
    registrationNo:'', // fill from business licence
    vatId:'',          // VAT / EORI when applicable
    foundedYear:'',    // company incorporation year — NOT the factory's
    factorySince:'1999', // partner factory producing since 1999 (honest attribution)
    markets:'Europe, North America, the Middle East and Southeast Asia',
   },
   trade:{ // commercial terms — shown on /trade-terms; empty = neutral wording
    moq:'',
    leadTime:'',
    incoterms:'',
    paymentTerms:'',
    warranty:'',
    samples:'',
   },
  }
 },
 app:{head:{htmlAttrs:{lang:'en'},titleTemplate:'%s | RoadReady Auto',meta:[{charset:'utf-8'},{name:'viewport',content:'width=device-width, initial-scale=1'},{name:'theme-color',content:'#f5f4f0'},{property:'og:site_name',content:'RoadReady Auto'}],link:[{rel:'preconnect',href:'https://fonts.googleapis.com'},{rel:'preconnect',href:'https://fonts.gstatic.com',crossorigin:'anonymous'},{rel:'stylesheet',href:'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@500;600;700;800&display=swap'}],script:[{innerHTML:`(function(){var r=document.documentElement;r.classList.add('js');try{var s=localStorage.getItem('roadready-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d){r.setAttribute('data-theme','dark');}}catch(e){}})();`,tagPriority:'critical'}]}},nitro:{compressPublicAssets:true},typescript:{strict:true,typeCheck:false}
})
