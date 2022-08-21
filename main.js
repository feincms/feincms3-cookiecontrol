/**
 * cookie consent banner and modify button rendering
 */

import "./main.css"

// eslint-disable-next-line no-extra-semi
;(function () {
  const cookieName = "f3cc",
    settings = JSON.parse(document.getElementById("f3cc-data").textContent),
    injectedScripts = {}
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
        }),
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
    const re = new RegExp(`\\b${cookieName}=(.+?)\\b`)
    const matches = document.cookie.match(re)
    if (matches && matches.length) {
      return matches[1]
    }
  }

  function isKnownCookieValue() {
    return ["all", "essential"].includes(getCookie())
  }

  function getConsent() {
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

    if (getConsent()) {
      injectScripts()
    }

    if (!isKnownCookieValue()) {
      renderBanner()
    } else {
      renderModify()
    }
  }

  init()

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
