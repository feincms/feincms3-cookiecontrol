/**
 * cookie consent banner and modify button rendering
 *
 */

import "./main.css"

// eslint-disable-next-line no-extra-semi
;(function () {
  const cookieName = "f3cc",
    settings =
      window.f3ccData ||
      JSON.parse(document.getElementById("f3cc-data").textContent),
    injectedScripts = {},
    providerKey = "f3cc-embed-providers"
  let mainElement, banner, modify

  function crel(tagName, attributes = null, children = []) {
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

  function renderBanner() {
    if (banner) {
      show(banner)
      return
    }

    const content = [
      crel("div", { className: "f3cc-title", textContent: settings.heading }),
      crel("div", {
        className: "f3cc-description",
        textContent: settings.description,
      }),
    ]
    if (settings.privacyPolicyURL) {
      content[1].append(
        crel("br"),
        crel("a", {
          textContent: settings.privacyPolicyTitle,
          href: settings.privacyPolicyURL,
        })
      )
    }
    const buttons = [
      crel("a", {
        className: "f3cc-button accept",
        textContent: settings.buttonAccept,
        onclick: onAcceptClick,
      }),
      crel("a", {
        className: "f3cc-button reject",
        textContent: settings.buttonReject,
        onclick: onRejectClick,
      }),
    ]

    banner = crel("div", { className: "f3cc f3cc-banner" }, [
      crel("div", { className: "f3cc-container" }, [
        crel("div", { className: "f3cc-content" }, content),
        crel("div", { className: "f3cc-buttons" }, buttons),
      ]),
    ])

    mainElement.append(banner)
  }

  function renderModify() {
    if (modify) {
      show(modify)
      return
    }

    const ppu = settings.privacyPolicyURL
    const loc = window.location
    if (
      settings.buttonModify &&
      (!ppu || ppu == `${loc.protocol}//${loc.host}${loc.pathname}`)
    ) {
      modify = crel("a", {
        className: "f3cc-button modify",
        textContent: settings.buttonModify,
        onclick: (e) => {
          e.preventDefault()
          hide(modify)
          renderBanner()
        },
      })
      mainElement.append(modify)
    }
  }

  function setCookie(value) {
    let cookie = `${cookieName}=${value};max-age=31536000;path=/;sameSite=Strict`
    if (settings.domain) {
      cookie += `;domain=${settings.domain}`
    }
    document.cookie = cookie
  }

  function getCookie() {
    const cookies = document.cookie ? document.cookie.split("; ") : []
    const prefix = `${cookieName}=`
    for (let cookie of cookies) {
      if (cookie.startsWith(prefix))
        return decodeURIComponent(cookie.substring(prefix.length))
    }
  }

  function isKnownCookieValue() {
    return ["all", "essential"].includes(getCookie())
  }

  function getConsentToAll() {
    return getCookie() === "all"
  }

  function show(el) {
    el.style.display = ""
  }

  function hide(el) {
    if (el) el.style.display = "none"
  }

  function onAcceptClick(e) {
    e.preventDefault()
    setCookie("all")
    hide(banner)
    renderModify()
    injectScripts()
    initConsciousEmbed()
  }

  function onRejectClick(e) {
    e.preventDefault()
    setCookie("essential")
    hide(banner)
    renderModify()
  }

  function injectScripts() {
    for (let cookie of settings.cookies) {
      let node = injectedScripts[cookie.name]
      if (!node) {
        injectedScripts[cookie.name] = node = document.createElement("div")
        node.dataset.name = cookie.name
        mainElement.append(node)
      }
      node.innerHTML = cookie.script
      nodeScriptReplace(node)
    }
  }

  function init() {
    mainElement = crel("div", { id: "f3cc" })
    document.body.append(mainElement)

    if (getConsentToAll()) {
      injectScripts()
    }

    if (!isKnownCookieValue()) {
      renderBanner()
    } else {
      renderModify()
    }
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

  function initConsciousEmbed(addEnableListener = true) {
    const embedNodes = document.querySelectorAll(".f3cc-embed")

    function renderTemplate(parent, node) {
      const clone = node.content.cloneNode(true)
      parent.replaceWith(clone)
      nodeScriptReplace(clone)
    }

    embedNodes.forEach((node) => {
      const template = node.querySelector(".f3cc-embed__template")
      const enableButton = node.querySelector(".f3cc-embed__button")
      const nodesProvider = node.dataset.provider
      const providers = _lsGet(providerKey) || []

      if (template && nodesProvider) {
        if (getConsentToAll() || providers.some((p) => p === nodesProvider)) {
          renderTemplate(node, template)
        } else if (addEnableListener) {
          enableButton.addEventListener("click", () => {
            providers.push(nodesProvider)
            _lsSet(providerKey, providers)
            initConsciousEmbed(false)
          })
        }
      }
    })
  }

  init()
  initConsciousEmbed()

  /*
  The following functions allow executing scripts added via innerHTML
  Thanks, https://stackoverflow.com/a/20584396
  */
  function nodeScriptReplace(node) {
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

  function nodeScriptClone(node) {
    const script = document.createElement("script")
    script.text = node.innerHTML

    let i = -1,
      attrs = node.attributes,
      attr
    while (++i < attrs.length) {
      script.setAttribute((attr = attrs[i]).name, attr.value)
    }
    return script
  }

  function nodeScriptIs(node) {
    return node.tagName === "SCRIPT"
  }
})()
