(function(){let u="f3cc",m=document.getElementById("f3cc"),i=JSON.parse(document.getElementById("f3cc-data").textContent),a=null,r=null,p={};function n(e,t=null){const c=document.createElement(e);if(t)for(let[o,l]of Object.entries(t))o.startsWith("data-")?c.setAttribute(o,l):o==="children"?c.append(...l):c[o]=l;return c}function d(){if(a!=null){a.style.display="";return}a=n("div",{className:"f3cc f3cc-banner",children:[n("div",{className:"f3cc-container",children:[n("div",{className:"f3cc-content",children:[n("div",{className:"f3cc-title",textContent:i.heading}),n("div",{className:"f3cc-description",textContent:i.description})]}),n("div",{className:"f3cc-buttons",children:[n("a",{className:"f3cc-button accept",textContent:i.buttonAccept,onclick:k}),n("a",{className:"f3cc-button reject",textContent:i.buttonReject,onclick:C})]})]})]}),m.append(a)}function s(){if(r!=null){r.style.display="";return}i.buttonModify&&(r=n("div",{className:"f3cc-modify",children:[n("div",{className:"outer",children:[n("div",{className:"f3cc-buttons",children:[n("a",{className:"f3cc-button modify",textContent:i.buttonModify,onclick:e=>{e.preventDefault(),f(r),d()}})]})]})]}),m.append(r))}function h(e){let t=`${u}=${e};max-age=31536000;path=/;sameSite=Strict`;i.domain&&(t+=`;domain=${i.domain}`),document.cookie=t}function b(){const e=new RegExp(`\\b${u}=(.+?)\\b`),t=document.cookie.match(e);if(t&&t.length)return t[1]}function y(){return b()==="accepted"}function f(e){e!=null&&(e.style.display="none")}function k(e){e.preventDefault(),h("accepted"),f(a),s(),N()}function C(e){e.preventDefault(),h("rejected"),f(a),s()}function N(){for(let e of i.cookies){let t=p[e.name];t||(p[e.name]=t=document.createElement("div"),t.dataset.f3cc=e.name,document.body.append(t)),t.innerHTML=e.script,v(t)}}function g(){y()&&N(),document.body.addEventListener("click",e=>{e.target.closest("[data-open-f3cc-banner]")&&d()}),b()?s():d()}g();function v(e){if(S(e)===!0)e.parentNode.replaceChild(x(e),e);else{let t=-1,c=e.childNodes;for(;++t<c.length;)v(c[t])}return e}function x(e){let t=document.createElement("script");t.text=e.innerHTML;let c=-1,o=e.attributes,l;for(;++c<o.length;)t.setAttribute((l=o[c]).name,l.value);return t}function S(e){return e.tagName==="SCRIPT"}})();
