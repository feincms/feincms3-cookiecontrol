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
  for (const name in attributes) dom[name] = attributes[name]
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

  const existing = qs(".f3cc-modify")
  if (existing) {
    // Remember the element so that later renderModify() calls short circuit
    // above instead of adding the click listener again and again.
    modify = existing
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
  // biome-ignore lint/suspicious/noDocumentCookie: The recommended API isn't available everywhere
  d.cookie = cookie
}

const cookieRe = new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`)
const getCookie = () => {
  const match = d.cookie.match(cookieRe)
  return match && decodeURIComponent(match[1])
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

// The local storage may be unavailable (or contain garbage); fall back to
// remembering the providers for the lifetime of the page in that case.
let providersFallback
const acceptedProviders = () => {
  let providers = providersFallback
  try {
    providers = JSON.parse(localStorage.getItem(providerKey))
  } catch (_e) {}
  return Array.isArray(providers) ? providers : []
}
const setAcceptedProviders = (providers) => {
  providersFallback = providers
  try {
    localStorage.setItem(providerKey, JSON.stringify(providers))
  } catch (_e) {}
}

const renderAcceptedEmbeds = () => {
  const providers = acceptedProviders()

  for (const node of qsa(".f3cc-embed")) {
    const template = qs("template", node)
    const nodesProvider = node.dataset.provider

    if (template && nodesProvider) {
      if (getConsentToAll() || providers.includes(nodesProvider)) {
        const clone = template.content.cloneNode(true)
        // The .f3cc wrapper is optional: embeds may also be hand-written
        // markup which only uses .f3cc-embed.
        const target = node.closest(".f3cc") || node
        target.replaceWith(clone)
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
      const providers = acceptedProviders()
      const provider = node.dataset.provider
      if (!providers.includes(provider)) {
        providers.push(provider)
        setAcceptedProviders(providers)
      }
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
    newScriptEl[sTextContent] = oldScriptEl[sTextContent]
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
