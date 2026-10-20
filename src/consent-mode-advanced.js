/**
 * Google Consent Mode, "advanced" implementation
 *
 * Order 66: unlike everything else in this package, this expects Google Tag
 * Manager to be loaded on every page, before the visitor has decided
 * anything. GTM is contacted (and receives the IP address, the user agent and
 * the URL) regardless of the decision; "denied" only means that Google sets no
 * cookies and sends cookieless pings instead. Read the README before using it.
 *
 * Has to be loaded synchronously, before the GTM snippet.
 */

import { getCookie, sAll } from "./cookie.js"

const w = window
w.dataLayer = w.dataLayer || []
function gtag() {
  // biome-ignore lint/complexity/noArguments: arguments is fine here.
  w.dataLayer.push(arguments)
}

const signals = (granted) => {
  const value = granted ? "granted" : "denied"
  return {
    ad_user_data: value,
    ad_personalization: value,
    ad_storage: value,
    analytics_storage: value,
  }
}

gtag("consent", "default", signals(false))
// Strip ad click identifiers from the pings while ad_storage is denied.
gtag("set", "ads_data_redaction", true)

if (getCookie() === sAll) {
  gtag("consent", "update", signals(true))
}

w.addEventListener("f3cc_consent_granted", () => {
  gtag("consent", "update", signals(true))
})
w.addEventListener("f3cc_consent_denied", () => {
  gtag("consent", "update", signals(false))
})
