/**
 * cookie consent banner and modify button rendering
 *
 */

import "./main.css"

const qs = (selector, node = document) => node.querySelector(selector),
  body = document.body,
  sClassName = "className",
  sTextContent = "textContent",
  sInnerHTML = "innerHTML",
  cookieName = "f3cc",
  settings = window.f3ccData || JSON.parse(qs("#f3cc-data")[sTextContent]),
  injectedScripts = {},
  providerKey = "f3cc-embed-providers"
let mainElementRef, banner, modify

const crel = (tagName, attributes = null, children = []) => {
  const dom = document.createElement(tagName)
  if (attributes) {
    for (let [name, value] of Object.entries(attributes)) {
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
    (!ppu || ppu == `${loc.protocol}//${loc.host}${loc.pathname}`)
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
  for (let cookie of document.cookie.split("; ")) {
    if (cookie.startsWith(prefix))
      return decodeURIComponent(cookie.substring(prefix.length))
  }
}

const sAll = "all",
  sEssential = "essential"
const isKnownCookieValue = () => {
  const c = getCookie()
  return sAll == c || sEssential == c
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
  updateGAConsentData()
}

const injectAcceptedScripts = () => {
  if (getConsentToAll()) {
    for (let cookie of settings.cookies) {
      let node = injectedScripts[cookie.name]
      if (!node) {
        injectedScripts[cookie.name] = node = crel("div")
        node.dataset.name = cookie.name
        mainElement().append(node)
      }
      node.innerHTML = cookie.script
      nodeScriptReplace(node)
    }
  }
}

const updateGAConsentData = () => {
  window.dataLayer = window.dataLayer || []
  if (getConsentToAll()) {
    window.dataLayer.push([
      "consent",
      "update",
      {
        ad_user_data: "granted",
        ad_personalization: "granted",
        ad_storage: "granted",
        analytics_storage: "granted",
      },
    ])
  } else {
    window.dataLayer.push([
      "consent",
      "update",
      {
        ad_user_data: "denied",
        ad_personalization: "denied",
        ad_storage: "denied",
        analytics_storage: "denied",
      },
    ])
  }
}

const mainElement = () => {
  if (!mainElementRef) {
    mainElementRef = crel("div", { [sClassName]: "f3cc" })
    body.append(mainElementRef)
  }
  return mainElementRef
}

const _lsFallback = {},
  _lsSet = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      _lsFallback[key] = value
    }
  },
  _lsGet = (key) => {
    try {
      return JSON.parse(window.localStorage.getItem(key))
    } catch (e) {
      return _lsFallback[key]
    }
  }

const renderAcceptedEmbeds = (window.f3ccRenderEmbeds = () => {
  const providers = _lsGet(providerKey) || []
  const embedNodes = document.querySelectorAll(".f3cc-embed")

  embedNodes.forEach((node) => {
    const template = qs("template", node)
    const nodesProvider = node.dataset.provider

    if (template && nodesProvider) {
      if (getConsentToAll() || providers.includes(nodesProvider)) {
        const clone = template.content.cloneNode(true)
        node.closest(".f3cc").replaceWith(clone)
      }
    }
  })
})

const initEmbedClickListener = () => {
  body.addEventListener("click", (e) => {
    const button = e.target.closest(".f3cc-button")
    const node = button && button.closest(".f3cc-embed")
    if (button && node) {
      e.preventDefault()
      const providers = _lsGet(providerKey) || []
      providers.push(node.dataset.provider)
      _lsSet(providerKey, providers)
      renderAcceptedEmbeds()
    }
  })
}

/*
The following functions allow executing scripts added via innerHTML
Thanks, https://stackoverflow.com/a/20584396
*/
const nodeScriptReplace = (node) => {
  if (nodeScriptIs(node) === true) {
    node.parentNode.replaceChild(nodeScriptClone(node), node)
  } else {
    let i = -1,
      children = node.childNodes
    while (++i < children.length) {
      nodeScriptReplace(children[i])
    }
  }

  return node
}

const nodeScriptClone = (node) => {
  const script = crel("script")
  script.text = node.innerHTML

  let i = -1,
    attrs = node.attributes,
    attr
  while (++i < attrs.length) {
    script.setAttribute((attr = attrs[i]).name, attr.value)
  }
  return script
}

const nodeScriptIs = (node) => {
  return node.tagName === "SCRIPT"
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
