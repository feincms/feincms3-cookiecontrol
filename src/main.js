/**
 * cookie consent banner and modify button rendering
 *
 */

import "./main.css"

const w = window
const d = document
const qs = (selector, node = d) => node.querySelector(selector)
const qsa = (selector, node = d) => node.querySelectorAll(selector)
const body = d.body
const sClassName = "className"
const sTextContent = "textContent"
const sInnerHTML = "innerHTML"
const cookieName = "f3cc"
const settings = w.f3ccData || JSON.parse(qs("#f3cc-data")[sTextContent])
const injectedScripts = {}
const providerKey = "f3cc-embed-providers"
let mainElementRef
let banner
let modify

const crel = (tagName, attributes = null, children = []) => {
  const dom = d.createElement(tagName)
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
    display(banner)
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
    display(modify)
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
  const loc = w.location
  if (
    settings.buttonModify &&
    (!ppu || ppu === `${loc.protocol}//${loc.host}${loc.pathname}`)
  ) {
    modify = crel("a", {
      [sClassName]: "f3cc-button modify",
      [sTextContent]: settings.buttonModify,
      onclick: (e) => {
        e.preventDefault()
        display(modify, "none")
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
  d.cookie = cookie
}

const getCookie = () => {
  const prefix = `${cookieName}=`
  for (const cookie of d.cookie.split("; ")) {
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

const display = (el, display = "") => {
  if (el) el.style.display = display
}

const onAccept = (accept) => (e) => {
  e.preventDefault()
  setCookie(accept ? sAll : sEssential)
  display(banner, "none")
  renderModify()
  renderAcceptedEmbeds()
  injectAcceptedScripts()
  w.dispatchEvent(new Event(`f3cc_consent_${accept ? "granted" : "denied"}`))
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
    localStorage.setItem(key, JSON.stringify(value))
  } catch (_e) {
    _lsFallback[key] = value
  }
}
const _lsGet = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch (_e) {
    return _lsFallback[key]
  }
}

const renderAcceptedEmbeds = () => {
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
}
w.f3ccRenderEmbeds = renderAcceptedEmbeds

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
  elm[sInnerHTML] = html
  for (const oldScriptEl of qsa("script", elm)) {
    const newScriptEl = crel("script")
    for (const attr of oldScriptEl.attributes) {
      newScriptEl.setAttribute(attr.name, attr.value)
    }

    const scriptText = d.createTextNode(oldScriptEl[sInnerHTML])
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
