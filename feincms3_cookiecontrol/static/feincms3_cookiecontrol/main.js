/**
 * cookie consent banner, panel and revoke button rendering
 */
// eslint-disable-next-line no-extra-semi
;(function () {
  let cookieName = "feincms3-cookiecontrol",
    mainElement = document.getElementById("feincms3-cookiecontrol"),
    settings = JSON.parse(
      document.getElementById("feincms3-cookiecontrol-data").textContent
    ),
    banner = null,
    panel = null,
    revoke = null,
    checkboxes = [],
    injectedScripts = []

  /**
   * Recursive createElement wrapper for rendering panel, banner and revoke views
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
        addElement("div", "title", html.heading, el)
      }
      if (typeof html.content !== "undefined") {
        addElement("div", "description", html.content, el)
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
      banner = addElement("div", "ccp-banner")
      let outerWrap = addElement("div", "outer")
      addElement("div", "inner", settings.banner, outerWrap)
      let buttonWrap = addElement("div", "wrap")
      addElement(
        "a",
        "btn btn-panel",
        settings.banner.buttonPanel,
        buttonWrap,
        onPanelClick
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

  function renderRevoke() {
    if (revoke != null) {
      revoke.style.display = ""
      return
    }

    if (settings.revoke) {
      revoke = addElement("div", "ccp-revoke")
      let outerWrap = addElement("div", "outer")
      addElement("div", "inner", "", outerWrap)
      let buttonWrap = addElement("div", "wrap")
      addElement(
        "a",
        "btn btn-revoke",
        settings.revoke.buttonPanel,
        buttonWrap,
        onPanelClick
      )
      outerWrap.appendChild(buttonWrap)
      revoke.appendChild(outerWrap)
      mainElement.appendChild(revoke)
    }
  }

  function renderPanel() {
    if (panel != null) {
      panel.style.display = ""
      return
    }

    if (settings.panel) {
      panel = addElement("div", "ccp-panel")
      let outerWrap = addElement("div", "outer")
      addElement("div", "inner", settings.panel, outerWrap)

      let form = document.createElement("form")
      for (let groupId in settings.groups) {
        let groupWrap = addElement("div", "group")
        let inputLabel = addElement("label")

        let groupInput = document.createElement("input")
        groupInput.name = groupId
        groupInput.id = "ccp-group-" + groupId
        groupInput.type = "checkbox"
        inputLabel.htmlFor = groupInput.id

        if (
          settings.groups[groupId].preselected == 1 ||
          consentedGroups().indexOf(groupId) >= 0
        ) {
          groupInput.checked = true
        }

        if (settings.groups[groupId].disabled == 1) {
          groupInput.disabled = true
        }

        checkboxes.push(groupInput)
        groupWrap.appendChild(groupInput)
        addElement(
          "div",
          "label-title",
          settings.groups[groupId].title,
          inputLabel
        )
        addElement(
          "div",
          "label-description",
          settings.groups[groupId].description,
          inputLabel
        )
        groupWrap.appendChild(inputLabel)
        form.appendChild(groupWrap)
      }
      outerWrap.appendChild(form)

      let buttonWrap = addElement("div", "wrap")
      addElement(
        "a",
        "btn btn-cancel",
        settings.panel.buttonCancel,
        buttonWrap,
        onCancelClick
      )
      addElement(
        "a",
        "btn btn-save",
        settings.panel.buttonSave,
        buttonWrap,
        onSaveClick
      )

      outerWrap.appendChild(buttonWrap)
      panel.appendChild(outerWrap)
      mainElement.appendChild(panel)
    }
  }

  function saveSelections() {
    let consented = []
    for (let i in checkboxes) {
      if (checkboxes[i].checked) {
        consented.push(checkboxes[i].name)
      }
    }
    setCookie(consented)
  }

  function acceptAll() {
    let consented = []
    for (let groupId in settings.groups) {
      consented.push(groupId)
    }
    setCookie(consented)
  }

  function setCookie(consented) {
    let cookie =
      cookieName + "=" + consented.join(",") + ";max-age=31536000;path=/"
    document.cookie = cookie
  }

  function revokeCookie() {
    let cookie = cookieName + "=;max-age=-1;path=/"
    document.cookie = cookie
  }

  function getCookie() {
    let cookies = document.cookie.split(";")
    let cookie = false
    if (typeof cookies !== "undefined") {
      cookies.forEach((docCookie) => {
        if (docCookie.split("=")[0].trim() == cookieName) {
          cookie = docCookie.split("=")[1]
        }
      })
    }
    return cookie
  }

  function consentedGroups() {
    let cookie = getCookie()
    return cookie ? cookie.split(",") : []
  }

  function hide(el) {
    if (el != null) el.style.display = "none"
  }

  function onSaveClick(e) {
    e.preventDefault()
    saveSelections()
    hide(banner)
    hide(panel)
    renderRevoke()
    injectNewScripts()
  }

  function onAcceptAllClick(e) {
    e.preventDefault()
    acceptAll()
    hide(banner)
    hide(panel)
    renderRevoke()
    injectNewScripts()
  }

  function onCancelClick(e) {
    e.preventDefault()
    hide(panel)
    init()
  }

  function onPanelClick(e) {
    e.preventDefault()
    hide(banner)
    hide(revoke)
    revokeCookie()
    renderPanel()
  }

  function injectScript(cookieKey, injectCode) {
    if (typeof injectCode !== "undefined") {
      const node = document.createElement("script")
      document.body.appendChild(node)
      node.innerHTML = injectCode
      injectedScripts.push(cookieKey)
    }
  }

  function injectNewScripts() {
    let consenteds = consentedGroups()
    for (let cookieGroup in settings.groups) {
      for (let cookie in settings.groups[cookieGroup].cookies) {
        let cookieKey = settings.groups[cookieGroup].cookies[cookie]
        if (injectedScripts.indexOf(cookieKey) === -1) {
          if (consenteds.indexOf(cookieGroup) === -1) {
            injectScript(cookieKey, settings.cookies[cookieKey].inject_else)
          } else {
            injectScript(cookieKey, settings.cookies[cookieKey].inject_if)
          }
        }
      }
    }
  }

  function init() {
    injectNewScripts()

    if (!getCookie()) {
      renderBanner()
    } else {
      renderRevoke()
    }
  }

  init()
})()
