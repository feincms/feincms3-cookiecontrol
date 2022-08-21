/**
 * cookie consent banner and modify button rendering
 */

import "./main.css"

// eslint-disable-next-line no-extra-semi
;(function () {
  let cookieName = "f3cc",
    mainElement,
    settings = JSON.parse(document.getElementById("f3cc-data").textContent),
    banner,
    modify,
    injectedScripts = {}

  function crel(tagName, attributes = null) {
    const dom = document.createElement(tagName)
    if (attributes) {
      for (let [name, value] of Object.entries(attributes)) {
        if (name.startsWith("data-")) dom.setAttribute(name, value)
        else if (name === "children") dom.append(...value)
        else dom[name] = value
      }
    }
    return dom
  }

  function renderBanner() {
    if (banner) {
      banner.style.display = ""
      return
    }

    const content = [
      crel("div", {
        className: "f3cc-title",
        textContent: settings.heading,
      }),
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

    banner = crel("div", {
      className: "f3cc f3cc-banner",
      children: [
        crel("div", {
          className: "f3cc-container",
          children: [
            crel("div", {
              className: "f3cc-content",
              children: content,
            }),
            crel("div", {
              className: "f3cc-buttons",
              children: buttons,
            }),
          ],
        }),
      ],
    })

    mainElement.append(banner)
  }

  function renderModify() {
    if (modify) {
      modify.style.display = ""
      return
    }

    if (settings.buttonModify) {
      modify = crel("div", {
        className: "f3cc-modify",
        children: [
          crel("div", {
            className: "outer",
            children: [
              crel("div", {
                className: "f3cc-buttons",
                children: [
                  crel("a", {
                    className: "f3cc-button modify",
                    textContent: settings.buttonModify,
                    onclick: (e) => {
                      e.preventDefault()
                      hide(modify)
                      renderBanner()
                    },
                  }),
                ],
              }),
            ],
          }),
        ],
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
        node.dataset.f3cc = cookie.name
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
    let script = document.createElement("script")
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
