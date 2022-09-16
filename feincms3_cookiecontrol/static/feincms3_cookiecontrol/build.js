(()=>{(function(){var f=document.createElement("style");f.textContent=":root{--f3cc-background-color:#e9e9e9;--f3cc-foreground-color:#000000;--f3cc-button-background:#cbcbcb;--f3cc-accept-background:#90f690;}#f3cc{font-size:16px;line-height:1.3;}#f3cc .f3cc-banner{position:fixed;bottom:0;width:100%;background:var(--f3cc-background-color);color:var(--f3cc-foreground-color);z-index:2000;padding:1rem 1rem 1.25rem;}#f3cc .f3cc-container{display:flex;gap:2rem;max-width:70em;margin:0 auto;width:80%;}@media screen and (max-width:60rem){#f3cc .f3cc-container{width:100%;flex-direction:column;}}#f3cc .f3cc-title{font-size:1.5em;font-weight:bold;margin-bottom:0.25em;}#f3cc .f3cc-description a{color:inherit;text-decoration:underline;}#f3cc .f3cc-description a:hover{opacity:0.7;}#f3cc .f3cc-buttons{display:flex;flex-direction:column;gap:1rem;justify-content:center;align-items:stretch;}#f3cc .f3cc-button, .f3cc-embed__button{display:inline-block;background:var(--f3cc-button-background);color:var(--f3cc-foreground-color);padding:0.8rem 1.2rem;white-space:nowrap;text-decoration:none;text-align:center;cursor:pointer;border:none;}#f3cc .f3cc-button:hover, .f3cc-embed__button:hover{opacity:0.7;}#f3cc .f3cc-button.accept, .f3cc-embed .f3cc-embed__button{background:var(--f3cc-accept-background);}#f3cc .f3cc-button.modify{position:fixed;z-index:2000;bottom:1rem;right:1rem;}.f3cc-embed .f3cc-embed__overlay{background-color:var(--f3cc-background-color);padding:4rem 2.5rem;}.f3cc-embed .f3cc-embed__statement{margin-bottom:1em;}",document.head.appendChild(f)})();(function(){let f="f3cc",o=window.f3ccData||JSON.parse(document.getElementById("f3cc-data").textContent),v={},y="f3cc-embed-providers",l,d,s;function i(e,t=null,c=[]){let n=document.createElement(e);if(t)for(let[r,a]of Object.entries(t))r.startsWith("data-")?n.setAttribute(r,a):n[r]=a;return n.append(...c),n}function k(){if(d){N(d);return}let e=[i("div",{className:"f3cc-title",textContent:o.heading}),i("div",{className:"f3cc-description",textContent:o.description})];o.privacyPolicyURL&&e[1].append(i("br"),i("a",{textContent:o.privacyPolicyTitle,href:o.privacyPolicyURL}));let t=[i("a",{className:"f3cc-button accept",textContent:o.buttonAccept,onclick:R}),i("a",{className:"f3cc-button reject",textContent:o.buttonReject,onclick:j})];d=i("div",{className:"f3cc f3cc-banner"},[i("div",{className:"f3cc-container"},[i("div",{className:"f3cc-content"},e),i("div",{className:"f3cc-buttons"},t)])]),l.append(d)}function u(){if(s){N(s);return}let e=o.privacyPolicyURL,t=window.location;o.buttonModify&&(!e||e==`${t.protocol}//${t.host}${t.pathname}`)&&(s=i("a",{className:"f3cc-button modify",textContent:o.buttonModify,onclick:c=>{c.preventDefault(),m(s),k()}}),l.append(s))}function x(e){let t=`${f}=${e};max-age=31536000;path=/;sameSite=Strict`;o.domain&&(t+=`;domain=${o.domain}`),document.cookie=t}function w(){let e=document.cookie?document.cookie.split("; "):[],t=`${f}=`;for(let c of e)if(c.startsWith(t))return decodeURIComponent(c.substring(t.length))}function E(){return["all","essential"].includes(w())}function C(){return w()==="all"}function N(e){e.style.display=""}function m(e){e&&(e.style.display="none")}function R(e){e.preventDefault(),x("all"),m(d),u(),S(),p()}function j(e){e.preventDefault(),x("essential"),m(d),u()}function S(){for(let e of o.cookies){let t=v[e.name];t||(v[e.name]=t=document.createElement("div"),t.dataset.name=e.name,l.append(t)),t.innerHTML=e.script,b(t)}}function $(){l=i("div",{id:"f3cc"}),document.body.append(l),C()&&S(),E()?u():k()}let _={},A=(e,t)=>{try{window.localStorage.setItem(e,JSON.stringify(t))}catch{_[e]=t}},I=e=>{try{return JSON.parse(window.localStorage.getItem(e))}catch{return _[e]}};function p(e=!0){let t=document.querySelectorAll(".f3cc-embed");function c(n,r){let a=r.content.cloneNode(!0);n.replaceWith(a),b(a)}t.forEach(n=>{let r=n.querySelector(".f3cc-embed__template"),a=n.querySelector(".f3cc-embed__button"),g=n.dataset.provider,h=I(y)||[];r&&g&&(C()||h.some(T=>T===g)?c(n,r):e&&a.addEventListener("click",()=>{h.push(g),A(y,h),p(!1)}))})}$(),p();function b(e){if(P(e)===!0)e.parentNode.replaceChild(L(e),e);else{let t=-1,c=e.childNodes;for(;++t<c.length;)b(c[t])}return e}function L(e){let t=document.createElement("script");t.text=e.innerHTML;let c=-1,n=e.attributes,r;for(;++c<n.length;)t.setAttribute((r=n[c]).name,r.value);return t}function P(e){return e.tagName==="SCRIPT"}})();})();
