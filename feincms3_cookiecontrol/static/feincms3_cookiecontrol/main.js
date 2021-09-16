/**
 * cookie consent banner, panel and revoke button rendering
 */
// eslint-disable-next-line no-extra-semi
;(function () {
  let cookieName = "f3cc",
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
      revoke = addElement("div", "f3cc-revoke")
      let outerWrap = addElement("div", "outer")
      addElement("div", "inner", "", outerWrap)
      let buttonWrap = addElement("div", "f3cc-buttons")
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
      panel = addElement("div", "f3cc f3cc-panel")
      let outerWrap = addElement("div", "outer")
      addElement("div", "inner", settings.panel, outerWrap)

      let form = document.createElement("form")
      for (let categoryId in settings.categories) {
        let categoryWrap = addElement("div", "f3cc-category")
        let inputLabel = addElement("label")

        let categoryInput = document.createElement("input")
        categoryInput.name = categoryId
        categoryInput.id = "f3cc-category-" + categoryId
        categoryInput.type = "checkbox"
        inputLabel.htmlFor = categoryInput.id

        if (
          settings.categories[categoryId].preselected == 1 ||
          consentedCategories().indexOf(categoryId) >= 0
        ) {
          categoryInput.checked = true
        }

        if (settings.categories[categoryId].disabled == 1) {
          categoryInput.disabled = true
        }

        checkboxes.push(categoryInput)
        categoryWrap.appendChild(categoryInput)
        addElement(
          "div",
          "f3cc-title",
          settings.categories[categoryId].title,
          inputLabel
        )
        addElement(
          "div",
          "f3cc-description",
          settings.categories[categoryId].description,
          inputLabel
        )
        categoryWrap.appendChild(inputLabel)
        form.appendChild(categoryWrap)
      }
      outerWrap.appendChild(form)

      let buttonWrap = addElement("div", "f3cc-buttons")
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
    for (let categoryId in settings.categories) {
      consented.push(categoryId)
    }
    setCookie(consented)
  }

  function setCookie(consented) {
    let cookie =
      cookieName +
      "=" +
      consented.join(",") +
      ";max-age=31536000;path=/;sameSite=Strict"
    document.cookie = cookie
  }

  function revokeCookie() {
    let cookie = cookieName + "=;max-age=-1;path=/;sameSite=Strict"
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

  function consentedCategories() {
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
    let consenteds = consentedCategories()
    for (let cookieCategory in settings.categories) {
      for (let cookie in settings.categories[cookieCategory].cookies) {
        let cookieKey = settings.categories[cookieCategory].cookies[cookie]
        if (injectedScripts.indexOf(cookieKey) === -1) {
          if (consenteds.indexOf(cookieCategory) === -1) {
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

    document.body.addEventListener("click", function(e) {
      const btn = e.target.closest("[data-open-f3cc-panel]")
      if (btn) {
        onPanelClick(e)
      }
    })

    if (!getCookie()) {
      renderBanner()
    } else {
      renderRevoke()
    }
  }

  init()
})()
