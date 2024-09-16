/**
 * cookie consent banner and modify button rendering
 *
 */

import "./main.css"

const qs = (selector, node = document) => node.querySelector(selector)
const qsa = (selector, node = document) => node.querySelectorAll(selector)
const body = document.body
const sClassName = "className"
const sTextContent = "textContent"
const sInnerHTML = "innerHTML"
const cookieName = "f3cc"
const settings = window.f3ccData || JSON.parse(qs("#f3cc-data")[sTextContent])
const injectedScripts = {}
const providerKey = "f3cc-embed-providers"
let mainElementRef
let banner
let modify

const crel = (tagName, attributes = null, children = []) => {
  const dom = document.createElement(tagName)
  if (attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      if (name.startsWith("data-")) dom.setAttribute(name, value)
      else dom[name] = value
    }
  }
  dom.append(...children)
  return dom
}

const renderBanner = () => {
  if (banner) {
    show(banner)
    return
  }

  const content = [
    crel("div", {
      [sClassName]: "f3cc-title",
      [sTextContent]: settings.heading,
    }),
    crel("div", {
      [sClassName]: "f3cc-description",
      [sInnerHTML]: settings.description,
    }),
  ]
  const buttons = [
    crel("a", {
      [sClassName]: "f3cc-button accept",
      [sTextContent]: settings.buttonAccept,
      onclick: onAccept(true),
    }),
    crel("a", {
      [sClassName]: "f3cc-button reject",
      [sTextContent]: settings.buttonReject,
      onclick: onAccept(false),
    }),
  ]

  banner = crel("div", { [sClassName]: "f3cc f3cc-banner" }, [
    crel("div", { [sClassName]: "f3cc-container" }, [
      crel("div", { [sClassName]: "f3cc-content" }, content),
      crel("div", { [sClassName]: "f3cc-buttons" }, buttons),
    ]),
  ])

  mainElement().append(banner)
}

const renderModify = () => {
  if (modify) {
    show(modify)
    return
  }

  let existing
  if ((existing = qs(".f3cc-modify"))) {
    existing.addEventListener("click", (e) => {
      e.preventDefault()
      renderBanner()
    })
    return
  }

  const ppu = settings.ppu
  const loc = window.location
  if (
    settings.buttonModify &&
    (!ppu || ppu === `${loc.protocol}//${loc.host}${loc.pathname}`)
  ) {
    modify = crel("a", {
      [sClassName]: "f3cc-button modify",
      [sTextContent]: settings.buttonModify,
      onclick: (e) => {
        e.preventDefault()
        hide(modify)
        renderBanner()
      },
    })
    mainElement().append(modify)
  }
}

const setCookie = (value) => {
  let cookie = `${cookieName}=${value};max-age=31536000;path=/;sameSite=Strict`
  if (settings.domain) {
    cookie += `;domain=${settings.domain}`
  }
  document.cookie = cookie
}

const getCookie = () => {
  const prefix = `${cookieName}=`
  for (const cookie of document.cookie.split("; ")) {
    if (cookie.startsWith(prefix))
      return decodeURIComponent(cookie.substring(prefix.length))
  }
}

const sAll = "all"
const sEssential = "essential"
const isKnownCookieValue = () => {
  const c = getCookie()
  return sAll === c || sEssential === c
}

const getConsentToAll = () => {
  return getCookie() === sAll
}

const show = (el) => {
  el.style.display = ""
}

const hide = (el) => {
  if (el) el.style.display = "none"
}

const onAccept = (accept) => (e) => {
  e.preventDefault()
  setCookie(accept ? sAll : sEssential)
  hide(banner)
  renderModify()
  renderAcceptedEmbeds()
  injectAcceptedScripts()
  window.dispatchEvent(
    new Event(`f3cc_consent_${accept ? "granted" : "denied"}`),
  )
}

const injectAcceptedScripts = () => {
  if (getConsentToAll()) {
    for (const cookie of settings.cookies) {
      let node = injectedScripts[cookie.name]
      if (!node) {
        injectedScripts[cookie.name] = node = crel("div")
        node.dataset.name = cookie.name
        mainElement().append(node)
      }
      setInnerHTML(node, cookie.script)
    }
  }
}

const mainElement = () => {
  if (!mainElementRef) {
    mainElementRef = crel("div", { [sClassName]: "f3cc" })
    body.append(mainElementRef)
  }
  return mainElementRef
}

const _lsFallback = {}
const _lsSet = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (_e) {
    _lsFallback[key] = value
  }
}
const _lsGet = (key) => {
  try {
    return JSON.parse(window.localStorage.getItem(key))
  } catch (_e) {
    return _lsFallback[key]
  }
}

const renderAcceptedEmbeds = (window.f3ccRenderEmbeds = () => {
  const providers = _lsGet(providerKey) || []

  for (const node of qsa(".f3cc-embed")) {
    const template = qs("template", node)
    const nodesProvider = node.dataset.provider

    if (template && nodesProvider) {
      if (getConsentToAll() || providers.includes(nodesProvider)) {
        const clone = template.content.cloneNode(true)
        node.closest(".f3cc").replaceWith(clone)
      }
    }
  }
})

const initEmbedClickListener = () => {
  body.addEventListener("click", (e) => {
    const button = e.target.closest(".f3cc-button")
    const node = button?.closest(".f3cc-embed")
    if (button && node) {
      e.preventDefault()
      const providers = _lsGet(providerKey) || []
      providers.push(node.dataset.provider)
      _lsSet(providerKey, providers)
      renderAcceptedEmbeds()
    }
  })
}

const setInnerHTML = (elm, html) => {
  elm.innerHTML = html
  for (const oldScriptEl of qsa("script", elm)) {
    const newScriptEl = document.createElement("script")
    for (const attr of oldScriptEl.attributes) {
      newScriptEl.setAttribute(attr.name, attr.value)
    }

    const scriptText = document.createTextNode(oldScriptEl.innerHTML)
    newScriptEl.appendChild(scriptText)

    oldScriptEl.replaceWith(newScriptEl)
  }
}

/*
const initEmbedMutationObserver = () => {
  const observer = new MutationObserver(renderAcceptedEmbeds)
  observer.observe(body, { subtree: true, childList: true })
}
initEmbedMutationObserver()
*/

injectAcceptedScripts()
renderAcceptedEmbeds()
initEmbedClickListener()

if (!isKnownCookieValue()) {
  renderBanner()
} else {
  renderModify()
}
