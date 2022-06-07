/**
 * cookie consent banner and modify button rendering
 */
// eslint-disable-next-line no-extra-semi
;(function () {
  let cookieName = "f3cc",
    mainElement = document.getElementById("f3cc"),
    settings = JSON.parse(document.getElementById("f3cc-data").textContent),
    banner = null,
    modify = null,
    injectedScripts = {}

  /**
   * Recursive createElement wrapper for rendering banner and modify views
   *
   * @param {String} tag
   * @param {String} className
   * @param {String} html
   * @param {HTMLElement} parent
   * @param {Function} onClick
   */
  function addElement(
    tag,
    className = null,
    html = null,
    parent = null,
    onClick = null
  ) {
    let el = document.createElement(tag)
    if (tag == "a") {
      el.setAttribute("href", "")
    }
    if (html) {
      if (typeof html.heading !== "undefined") {
        addElement("div", "f3cc-title", html.heading, el)
      }
      if (typeof html.content !== "undefined") {
        addElement("div", "f3cc-description", html.content, el)
      }
      if (
        typeof html.heading === "undefined" &&
        typeof html.content === "undefined"
      ) {
        el.innerHTML = html
      }
    }
    if (className) {
      el.className = className
    }
    if (onClick) {
      el.addEventListener("click", onClick)
    }
    if (parent) {
      parent.appendChild(el)
    } else {
      return el
    }
  }

  function renderBanner() {
    if (banner != null) {
      banner.style.display = ""
      return
    }

    if (settings.banner) {
      banner = addElement("div", "f3cc f3cc-banner")
      let outerWrap = addElement("div", "outer")
      addElement("div", "f3cc-description", settings.banner, outerWrap)
      let buttonWrap = addElement("div", "f3cc-buttons")
      addElement(
        "a",
        "btn btn-reject",
        settings.banner.buttonReject,
        buttonWrap,
        onRejectAllClick
      )
      addElement(
        "a",
        "btn btn-accept",
        settings.banner.buttonAccept,
        buttonWrap,
        onAcceptAllClick
      )
      outerWrap.appendChild(buttonWrap)
      banner.appendChild(outerWrap)
      mainElement.appendChild(banner)
    }
  }

  function renderModify() {
    if (modify != null) {
      modify.style.display = ""
      return
    }

    if (settings.modify) {
      modify = addElement("div", "f3cc-modify")
      let outerWrap = addElement("div", "outer")
      addElement("div", "inner", "", outerWrap)
      let buttonWrap = addElement("div", "f3cc-buttons")
      addElement(
        "a",
        "btn btn-modify",
        settings.modify.buttonPanel,
        buttonWrap,
        (event) => {
          event.preventDefault()
          renderBanner()
        }
      )
      outerWrap.appendChild(buttonWrap)
      modify.appendChild(outerWrap)
      mainElement.appendChild(modify)
    }
  }

  function acceptAll() {
    setCookie("accepted")
  }

  function rejectAll() {
    setCookie("rejected")
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

  function getConsent() {
    return getCookie() === "accepted"
  }

  function hide(el) {
    if (el != null) el.style.display = "none"
  }

  function onAcceptAllClick(e) {
    e.preventDefault()
    acceptAll()
    hide(banner)
    renderModify()
    injectNewScripts()
  }

  function onRejectAllClick(e) {
    e.preventDefault()
    rejectAll()
    hide(banner)
    renderModify()
  }

  /* Thanks, https://stackoverflow.com/a/20584396 */
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

  function injectScript(cookieKey, injectCode) {
    if (typeof injectCode !== "undefined") {
      let node = injectedScripts[cookieKey]
      if (!node) {
        injectedScripts[cookieKey] = node = document.createElement("div")
        node.dataset.f3cc = cookieKey
        document.body.appendChild(node)
      }
      node.innerHTML = injectCode
      nodeScriptReplace(node)
    }
  }

  function injectNewScripts() {
    if (getConsent()) {
      for (let cookie of settings.cookies) {
        injectScript(cookie.name, cookie.inject_if)
      }
    }
  }

  function init() {
    injectNewScripts()

    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-f3cc-banner]")
      if (btn) {
        renderBanner()
      }
    })

    if (!getCookie()) {
      renderBanner()
    } else {
      renderModify()
    }
  }

  init()
})()
