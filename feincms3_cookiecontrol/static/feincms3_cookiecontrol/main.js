/**
 * cookie consent banner, panel and modify button rendering
 */
// eslint-disable-next-line no-extra-semi
;(function () {
  let cookieName = "f3cc",
    mainElement = document.getElementById("f3cc"),
    settings = JSON.parse(document.getElementById("f3cc-data").textContent),
    banner = null,
    panel = null,
    modify = null,
    checkboxes = [],
    injectedScripts = {}

  /**
   * Recursive createElement wrapper for rendering panel, banner and modify views
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
        onPanelClick
      )
      outerWrap.appendChild(buttonWrap)
      modify.appendChild(outerWrap)
      mainElement.appendChild(modify)
    }
  }

  function renderPanel() {
    disableScrolling(true)

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
        let categoryWrap = addElement("div")
        categoryWrap.className = "f3cc-category"
        let inputLabel = addElement("label")

        let categoryInput = document.createElement("input")
        categoryInput.name = categoryId
        categoryInput.id = `f3cc-category-${categoryId}`
        categoryInput.type = "checkbox"
        inputLabel.htmlFor = categoryInput.id

        if (
          settings.categories[categoryId].preselected ||
          consentedCategories().indexOf(categoryId) >= 0
        ) {
          categoryInput.checked = true
        }

        if (settings.categories[categoryId].disabled) {
          categoryInput.disabled = true
        }

        checkboxes.push(categoryInput)
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

        categoryWrap.append(categoryInput, inputLabel)
        form.append(categoryWrap)
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
    let cookie = `${cookieName}=${consented.join(
      ","
    )};max-age=31536000;path=/;sameSite=Strict`
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

  function disableScrolling(disable) {
    if (disable) {
      // When the modal is shown, we want a fixed body
      document.body.style.top = `-${window.scrollY}px`
      document.body.classList.add("f3cc-overlay")
    } else {
      const scrollY = document.body.style.top
      document.body.style.top = ""
      document.body.classList.remove("f3cc-overlay")
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1)
    }
  }

  function onSaveClick(e) {
    e.preventDefault()
    saveSelections()
    hide(banner)
    hide(panel)
    disableScrolling(false)
    renderModify()
    injectNewScripts()
  }

  function onAcceptAllClick(e) {
    e.preventDefault()
    acceptAll()
    hide(banner)
    hide(panel)
    disableScrolling(false)
    renderModify()
    injectNewScripts()
  }

  function onCancelClick(e) {
    e.preventDefault()
    hide(panel)
    disableScrolling(false)
    init()
  }

  function onPanelClick(e) {
    e.preventDefault()
    hide(banner)
    hide(modify)
    renderPanel()
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
    let consenteds = consentedCategories()
    for (let cookieCategory in settings.categories) {
      const key = consenteds.includes(cookieCategory)
        ? "inject_if"
        : "inject_else"
      for (let cookie of settings.categories[cookieCategory].cookies) {
        injectScript(cookie.name, cookie[key])
      }
    }
  }

  function init() {
    injectNewScripts()

    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-f3cc-panel]")
      if (btn) {
        onPanelClick(e)
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
