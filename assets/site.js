/* FMF-AI: progressive navigation and accessible public-page interactions. */
(()=>{
'use strict';
const scriptUrl=document.currentScript?.src||document.querySelector('script[data-site-root]')?.dataset.siteRoot||new URL('assets/site.js',location.href).href;
const baseUrl=new URL('../',scriptUrl);
const nav=document.getElementById('navigation-links');
const toggle=document.querySelector('.menu-toggle');
const contrastButtons=[...document.querySelectorAll('.contrast-toggle')];
const scrim=document.querySelector('.sidebar-scrim');
const sidebar=document.getElementById('site-sidebar');
let navController=null;

// Resolve root-relative-to-site links once so internal navigation also works on /abstracts/*.html.
for(const a of document.querySelectorAll('.nav-links a, .site-logo, .mobile-brand, .footer-links a')){
  const h=a.getAttribute('href');if(h&&!/^(https?:|mailto:|tel:|#)/i.test(h))a.href=new URL(h,h.startsWith('../')?document.baseURI:baseUrl).href;
}
function syncSidebarInert(){
 if(sidebar)sidebar.inert=window.innerWidth<=960&&!document.body.classList.contains('sidebar-open');
}
function closeSidebar(restoreFocus=false){
 const open=document.body.classList.contains('sidebar-open');
 document.body.classList.remove('sidebar-open');
 toggle?.setAttribute('aria-expanded','false');
 toggle?.setAttribute('aria-label','Open navigation menu');
 syncSidebarInert();
 if(open&&restoreFocus)toggle?.focus();
}
if(toggle&&sidebar){
 toggle.addEventListener('click',()=>{
   const open=document.body.classList.toggle('sidebar-open');
   toggle.setAttribute('aria-expanded',String(open));
   toggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
   syncSidebarInert();
   if(open)sidebar.querySelector('.nav-links a')?.focus();
 });
 scrim?.addEventListener('click',()=>closeSidebar(true));
 document.addEventListener('keydown',e=>{
   if(!document.body.classList.contains('sidebar-open'))return;
   if(e.key==='Escape'){closeSidebar(true);return;}
   if(e.key==='Tab'){
     const focusable=[...sidebar.querySelectorAll('a[href],button:not([disabled])')];
     if(!focusable.length)return;
     const first=focusable[0],last=focusable[focusable.length-1];
     if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
     else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   }
 });
 window.addEventListener('resize',()=>{if(window.innerWidth>960)closeSidebar();syncSidebarInert()});
 syncSidebarInert();
}
if(contrastButtons.length){
 const sync=()=>{
   const on=document.documentElement.classList.contains('high-contrast');
   for(const button of contrastButtons){
     button.setAttribute('aria-pressed',String(on));
     button.setAttribute('aria-label',on?'Disable high-contrast view':'Enable high-contrast view');
     button.title=on?'Standard view':'High-contrast view';
   }
 };
 sync();
 for(const button of contrastButtons)button.addEventListener('click',()=>{
   const on=document.documentElement.classList.toggle('high-contrast');
   try{localStorage.setItem('fmf-high-contrast',on?'on':'off')}catch(e){}
   sync();
 });
}
function initPage(){
  initTabs();initAbstracts();initRegistration();
}
function initTabs(){
 const tabs=[...document.querySelectorAll('[role="tab"]')];if(!tabs.length)return;
 const activate=i=>tabs.forEach((t,j)=>{
   const selected=i===j;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;
   const panel=document.getElementById(t.getAttribute('aria-controls'));if(panel)panel.hidden=!selected;
 });
 tabs.forEach((t,i)=>{
   t.addEventListener('click',()=>activate(i));
   t.addEventListener('keydown',e=>{
    const move=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
    if(move){e.preventDefault();const j=(i+move+tabs.length)%tabs.length;activate(j);tabs[j].focus();}
   });
 });
}
function initAbstracts(){
 const list=document.getElementById('abstract-list'),search=document.getElementById('abstract-search'),sort=document.getElementById('abstract-sort');
 if(!list||!search||!sort)return;
 const count=document.getElementById('abstract-count'),empty=document.getElementById('abstract-no-results');
 const entries=[...list.querySelectorAll('.abstract-entry')];
 const collator=new Intl.Collator('en',{sensitivity:'base',numeric:true});
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('en');
 function update(){
   const q=normalize(search.value.trim()),[by,order]=sort.value.split('-');
   const arranged=[...entries].sort((a,b)=>{
    const compare=collator.compare(a.dataset[by]||'',b.dataset[by]||'');
    return (order==='desc'?-1:1)*compare;
   });
   arranged.forEach(entry=>{entry.hidden=Boolean(q)&&!normalize(`${entry.dataset.author} ${entry.dataset.title}`).includes(q);list.append(entry);});
   const n=arranged.filter(x=>!x.hidden).length;
   count.textContent=n?`${n} ${n===1?'abstract':'abstracts'}`:'No abstracts found';
   empty.hidden=n>0||entries.length===0;
   if(entries.length===0){count.textContent='No abstracts published yet.';empty.hidden=true;}
 }
 search.addEventListener('input',update);sort.addEventListener('change',update);update();
}
function initRegistration(){
 const form=document.getElementById('registration-form');if(!form)return;
 const cfg=window.FMFAI_CONFIG||{},configuredEndpoint=String(cfg.registrationEndpoint||'').trim();
 const endpoint=/^https:\/\/script\.google\.com\/macros\/s\/[^/?#]+\/exec(?:\?[^#]*)?$/.test(configuredEndpoint) ? configuredEndpoint : '';
 const $=id=>document.getElementById(id),category=$('category'),presentation=$('presentation'),poster=$('poster');
 const presentationMirror=$('presentation-mirror'),posterMirror=$('poster-mirror');
 const overlay=$('review-overlay'),review=$('review-rows'),message=$('review-message'),status=$('form-status');
 const confirm=$('confirm-registration'),close=$('close-review'),edit=$('edit-registration');
 const activationNotice=$('registration-activation-note');
 let returnFocus=null,validationAttempted=false,errors=[];
 const val=id=>String($(id)?.value||'').trim();
 const invoiceValue=()=>form.querySelector('input[name="invoice"]:checked')?.value||'';
 const proformaValue=()=>$('proforma').checked?'Yes':'No';
 const requiresBilling=()=>invoiceValue()==='Yes'||proformaValue()==='Yes';
 const isRegular=()=>category.value==='Regular participant'||category.value==='PhD student';
 const isPosterOnly=()=>category.value==='Poster only';
 const isCompanion=()=>category.value==='Accompanying person';
 const meals=[
   ['mealJan28Lunch','28 January — Lunch'],
   ['mealJan28Dinner','28 January — Dinner'],
   ['mealJan29Lunch','29 January — Lunch'],
   ['mealJan29GalaDinner','29 January — Gala dinner'],
   ['mealJan30Lunch','30 January — Lunch']
 ];
 if(endpoint) {
   form.action=endpoint;
   if(activationNotice)activationNotice.hidden=true;
 } else {
   form.removeAttribute('action');
   if(activationNotice)activationNotice.hidden=false;
 }
 function switchTitle(blockId,id,on){
   const block=$(blockId),input=$(id);block.hidden=!on;input.disabled=!on;input.required=on;
   if(!on){input.value='';input.setCustomValidity('');input.removeAttribute('aria-invalid');}
 }
 function sync(resetContributions=false){
   if(resetContributions){presentation.checked=false;poster.checked=false;}
   const regular=isRegular(),pOnly=isPosterOnly(),companion=isCompanion(),chosen=!!category.value;
   $('contribution-block').hidden=!chosen||companion;
   presentation.checked=regular;
   presentation.disabled=true;
   presentationMirror.disabled=!regular;
   poster.disabled=!regular;
   posterMirror.disabled=!pOnly;
   if(pOnly)poster.checked=true;
   if(companion||!chosen)poster.checked=false;
   switchTitle('presentation-title-field','presentationTitle',regular);
   switchTitle('poster-title-field','posterTitle',pOnly||(regular&&poster.checked));
   $('category-rule').hidden=true;
   const bill=requiresBilling();$('billing-fields').hidden=!bill;
   const invoiceNotesVisible=invoiceValue()==='Yes';
   $('invoice-notes-field').hidden=!invoiceNotesVisible;
   for(const input of $('billing-fields').querySelectorAll('input,textarea')){
     const enabled=bill&&(input.id!=='invoiceNotes'||invoiceNotesVisible);
     input.disabled=!enabled;input.required=enabled&&['billingName','billingAddress'].includes(input.id);
     if(!enabled){input.value='';input.setCustomValidity('');input.removeAttribute('aria-invalid');}
   }
 }
 category.addEventListener('change',()=>sync(true));
 poster.addEventListener('change',()=>sync(false));
 for(const r of form.querySelectorAll('[name="invoice"]'))r.addEventListener('change',()=>sync(false));
 $('proforma').addEventListener('change',()=>sync(false));
 sync(true);
 function clearErrors(){
   for(const e of form.querySelectorAll('input,select,textarea')){e.setCustomValidity('');e.removeAttribute('aria-invalid');}
   for(const p of form.querySelectorAll('.field-error'))p.remove();
   for(const id of ['contribution-error','invoice-error']){$(id).hidden=true;$(id).textContent='';}
   status.textContent='';status.classList.remove('error-status');
 }
 function setError(input,text){
   errors.push({input,text});input.setCustomValidity(text);input.setAttribute('aria-invalid','true');
   const parent=input.closest('.field');if(parent){const p=document.createElement('p');p.className='field-error';p.textContent=text;parent.append(p);}
 }
 function groupError(id,text,input){errors.push({input,text});$(id).hidden=false;$(id).textContent=text;}
 function validate(focusFirst){
   clearErrors();errors=[];
   for(const [id,label] of [['firstName','first name'],['familyName','family name'],['email','email address'],['institution','institution']]){
     if(!val(id))setError($(id),`Please enter your ${label}.`);
   }
   if(val('email')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))){setError($('email'),'Please enter a valid email address.');}
   if(!category.value)setError(category,'Please select a registration category.');
   if(isRegular()){
     if(!val('presentationTitle'))setError($('presentationTitle'),'Please enter the title of your presentation.');
     if(poster.checked&&!val('posterTitle'))setError($('posterTitle'),'Please enter the title of your poster.');
   } else if(isPosterOnly()){
     if(!val('posterTitle'))setError($('posterTitle'),'Please enter the title of your poster.');
   }
   if(!invoiceValue())groupError('invoice-error','Please indicate whether you require an invoice.',form.querySelector('[name="invoice"]'));
   if(requiresBilling()){
     if(!val('billingName'))setError($('billingName'),'Please enter the billing recipient.');
     if(!val('billingAddress'))setError($('billingAddress'),'Please enter the billing address.');
   }
   if(errors.length){
     status.textContent='Please correct the highlighted fields before continuing.';status.classList.add('error-status');
     if(focusFirst){errors[0].input.focus();errors[0].input.scrollIntoView({behavior:'smooth',block:'center'});}
     return false;
   }
   return true;
 }
 form.addEventListener('input',()=>{if(validationAttempted)validate(false);});
 form.addEventListener('change',()=>{if(validationAttempted)validate(false);});
 function row(label,text){
   const div=document.createElement('div');div.className='review-item';
   const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=text||'—';div.append(dt,dd);review.append(div);
 }
 function currentRecord(){
   const regular=isRegular(),pOnly=isPosterOnly();
   return {
     requestId:val('requestId'),firstName:val('firstName'),familyName:val('familyName'),email:val('email'),institution:val('institution'),
     category:category.value,presentation:regular?'Yes':'No',presentationTitle:regular?val('presentationTitle'):'',
     poster:(pOnly||regular&&poster.checked)?'Yes':'No',posterTitle:(pOnly||regular&&poster.checked)?val('posterTitle'):'',
     invoice:invoiceValue(),proforma:proformaValue(),billingName:requiresBilling()?val('billingName'):'',
     billingAddress:requiresBilling()?val('billingAddress'):'',taxNumber:requiresBilling()?val('taxNumber'):'',
     invoiceNotes:invoiceValue()==='Yes'?val('invoiceNotes'):'',
     dietary:val('dietary'),comments:val('comments'),meals:meals.filter(([id])=>$(id).checked).map(([,label])=>label)
   };
 }
 function openReview(){
   returnFocus=document.activeElement;review.replaceChildren();message.textContent='';
   const r=currentRecord();
   row('Name',r.firstName+' '+r.familyName);row('Email',r.email);row('Institution',r.institution);
   row('Registration category',category.options[category.selectedIndex].textContent);
   if(r.presentation==='Yes')row('Presentation title',r.presentationTitle);
   if(r.poster==='Yes')row('Poster title',r.posterTitle);
   row('Invoice requested',r.invoice);
   row('Pro forma invoice requested',r.proforma);
   if(r.invoice==='Yes'||r.proforma==='Yes'){
     row('Billing recipient',r.billingName);row('Billing address',r.billingAddress);
     if(r.taxNumber)row('Tax / VAT number',r.taxNumber);
     if(r.invoiceNotes)row('Invoice notes',r.invoiceNotes);
   }
   row('Expected meals',r.meals.length?r.meals.join('; '):'None selected');
   if(r.dietary)row('Dietary requirements',r.dietary);
   if(r.comments)row('Additional comments',r.comments);
   if(!endpoint){
     message.textContent='Online registration is not yet available. You can review your details, but cannot submit them.';
     confirm.disabled=true;
   } else {
     confirm.disabled=false;
   }
   overlay.hidden=false;document.body.classList.add('dialog-open');close.focus();
 }
 function hideReview(){overlay.hidden=true;document.body.classList.remove('dialog-open');returnFocus?.focus();}
 form.addEventListener('submit',e=>{e.preventDefault();validationAttempted=true;if(validate(true))openReview();});
 close.addEventListener('click',hideReview);edit.addEventListener('click',hideReview);
 overlay.addEventListener('click',e=>{if(e.target===overlay)hideReview();});
 overlay.addEventListener('keydown',e=>{
   if(e.key==='Escape'){hideReview();return;}
   if(e.key==='Tab'){
     const buttons=[...overlay.querySelectorAll('button:not([disabled])')],first=buttons[0],last=buttons[buttons.length-1];
     if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
     else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   }
 });
 confirm.addEventListener('click',()=>{
   if(!endpoint){message.textContent='Registration has not been activated yet.';return;}
   if(!validate(false)){hideReview();status.textContent='Please correct the highlighted fields.';return;}
   if(!$('requestId').value)$('requestId').value=globalThis.crypto?.randomUUID?.()||`fmf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
   confirm.disabled=true;
   hideReview();
   status.textContent='Your registration will open in a new tab. It is complete only when that tab displays “Registration received”.';
   // Standard HTML POST works on GitHub Pages without relying on cross-origin fetch/CORS.
   // Server displays an authoritative receipt in a new tab; client never claims success early.
   HTMLFormElement.prototype.submit.call(form);
   setTimeout(()=>{confirm.disabled=false;},3000);
 });
}


// Fast navigation swaps only the content panel; the header/menu/footer stay mounted.
// Normal links remain the fallback when JavaScript is unavailable or fetch fails.
const ajaxSupported=/^https?:$/.test(location.protocol);
function activeNav(url){
  if(!nav)return;
  const path=new URL(url).pathname;
  for(const a of nav.querySelectorAll('a')){
    const selected=new URL(a.href).pathname===path;
    if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  }
  closeSidebar();
}
async function navigate(url,push=true){
  if(!ajaxSupported)return false;
  if(navController)navController.abort();navController=new AbortController();
  try{
    const response=await fetch(url,{signal:navController.signal,credentials:'same-origin'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const source=await response.text(),doc=new DOMParser().parseFromString(source,'text/html');
    const main=doc.querySelector('main'),old=document.querySelector('main');
    if(!main||!old)throw new Error('Main panel missing');
    // Resolve links against the fetched page, important on nested abstract pages.
    for(const a of main.querySelectorAll('a[href]')){
      const h=a.getAttribute('href');if(!/^([a-z]+:|#)/i.test(h))a.href=new URL(h,url).href;
    }
    old.replaceWith(main);
    document.title=doc.title;
    activeNav(url);
    if(push)history.pushState({page:url},'',url);
    window.scrollTo({top:0,behavior:'instant'});
    initPage();return true;
  }catch(error){
    if(error.name==='AbortError')return false;
    console.warn('Falling back to ordinary navigation:',error.message);
    location.assign(url);return false;
  }
}
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;
  if(a.hasAttribute('download')||a.target&&a.target!=='_self')return;
  const u=new URL(a.href,location.href);
  if(!ajaxSupported||u.origin!==location.origin||!u.pathname.endsWith('.html')||!u.pathname.startsWith(baseUrl.pathname)||/\/abstracts\/[^/]+\.html$/.test(u.pathname))return;
  e.preventDefault();navigate(u.href);
});
window.addEventListener('popstate',()=>navigate(location.href,false));
initPage();
})();
