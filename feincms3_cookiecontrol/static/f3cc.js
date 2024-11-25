(()=>{(function(){var t=document.createElement("style");t.textContent=".f3cc{font-size:16px;line-height:1.3;--_b:var(--f3cc-background,#e9e9e9);--_f:var(--f3cc-foreground,#000000);--_B:var(--f3cc-button-background,#cbcbcb);--_A:var(--f3cc-accept-background,#90f690);--_F:var(--f3cc-button-foreground,var(--_f));--_E:var(--f3cc-accept-foreground,var(--_F))}.f3cc .f3cc-banner{position:fixed;bottom:0;width:100%;background:var(--_b);color:var(--_f);z-index:2000;padding:1rem 1rem 1.25rem}.f3cc .f3cc-embed{background:var(--_b);color:var(--_f);padding:4rem}.f3cc .f3cc-container{display:flex;gap:2rem;max-width:70em;margin:0 auto;width:80%}@media (max-width:60rem){.f3cc .f3cc-container{width:100%;flex-direction:column}}.f3cc .f3cc-title{font-size:1.5em;font-weight:700;margin-bottom:.25em}.f3cc .f3cc-description a{color:inherit;text-decoration:underline}.f3cc .f3cc-description a:hover{opacity:.7}.f3cc .f3cc-buttons{display:flex;flex-direction:column;gap:1rem;justify-content:center;align-items:stretch}.f3cc .f3cc-button{display:inline-block;background:var(--_B);color:var(--_F);padding:.8rem 1.2rem;white-space:nowrap;text-decoration:none;text-align:center;cursor:pointer;border:none}.f3cc .f3cc-button:hover{opacity:.7}.f3cc .f3cc-button.accept{background:var(--_A);color:var(--_E)}.f3cc .f3cc-button.modify{position:fixed;z-index:2000;bottom:1rem;right:1rem}.f3cc-embed .f3cc-description{margin-bottom:1em}",document.head.appendChild(t)})();var b=window,s=document,k=(t,e=s)=>e.querySelector(t),w=(t,e=s)=>e.querySelectorAll(t),S=s.body,r="className",p="textContent",D="innerHTML",C="f3cc",i=b.f3ccData||JSON.parse(k("#f3cc-data")[p]),x={},g="f3cc-embed-providers",m,l,f,o=(t,e=null,n=[])=>{let c=s.createElement(t);if(e)for(let[a,d]of Object.entries(e))a.startsWith("data-")?c.setAttribute(a,d):c[a]=d;return c.append(...n),c},h=()=>{if(l){u(l);return}let t=[o("div",{[r]:"f3cc-title",[p]:i.heading}),o("div",{[r]:"f3cc-description",[D]:i.description})],e=[o("a",{[r]:"f3cc-button accept",[p]:i.buttonAccept,onclick:E(!0)}),o("a",{[r]:"f3cc-button reject",[p]:i.buttonReject,onclick:E(!1)})];l=o("div",{[r]:"f3cc f3cc-banner"},[o("div",{[r]:"f3cc-container"},[o("div",{[r]:"f3cc-content"},t),o("div",{[r]:"f3cc-buttons"},e)])]),_().append(l)},A=()=>{if(f){u(f);return}let t;if(t=k(".f3cc-modify")){t.addEventListener("click",c=>{c.preventDefault(),h()});return}let e=i.ppu,n=b.location;i.buttonModify&&(!e||e===`${n.protocol}//${n.host}${n.pathname}`)&&(f=o("a",{[r]:"f3cc-button modify",[p]:i.buttonModify,onclick:c=>{c.preventDefault(),u(f,"none"),h()}}),_().append(f))},H=t=>{let e=`${C}=${t};max-age=31536000;path=/;sameSite=Strict`;i.domain&&(e+=`;domain=${i.domain}`),s.cookie=e},T=()=>{let t=`${C}=`;for(let e of s.cookie.split("; "))if(e.startsWith(t))return decodeURIComponent(e.substring(t.length))},y="all",L="essential",I=()=>{let t=T();return y===t||L===t},M=()=>T()===y,u=(t,e="")=>{t&&(t.style.display=e)},E=t=>e=>{e.preventDefault(),H(t?y:L),u(l,"none"),A(),v(),N(),b.dispatchEvent(new Event(`f3cc_consent_${t?"granted":"denied"}`))},N=()=>{if(M())for(let t of i.cookies){let e=x[t.name];e||(x[t.name]=e=o("div"),e.dataset.name=t.name,_().append(e)),F(e,t.script)}},_=()=>(m||(m=o("div",{[r]:"f3cc"}),S.append(m)),m),$={},q=(t,e)=>{try{localStorage.setItem(t,JSON.stringify(e))}catch{$[t]=e}},j=t=>{try{return JSON.parse(localStorage.getItem(t))}catch{return $[t]}},v=()=>{let t=j(g)||[];for(let e of w(".f3cc-embed")){let n=k("template",e),c=e.dataset.provider;if(n&&c&&(M()||t.includes(c))){let a=n.content.cloneNode(!0);e.closest(".f3cc").replaceWith(a)}}};b.f3ccRenderEmbeds=v;var z=()=>{S.addEventListener("click",t=>{let e=t.target.closest(".f3cc-button"),n=e?.closest(".f3cc-embed");if(e&&n){t.preventDefault();let c=j(g)||[];c.push(n.dataset.provider),q(g,c),v()}})},F=(t,e)=>{t.innerHTML=e;for(let n of w("script",t)){let c=s.createElement("script");for(let d of n.attributes)c.setAttribute(d.name,d.value);let a=s.createTextNode(n.innerHTML);c.appendChild(a),n.replaceWith(c)}};N();v();z();I()?A():h();})();
