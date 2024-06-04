window.dataLayer = window.dataLayer || []
function gtag(){dataLayer.push(arguments)}
function setGAConsentData(action, status) {
  gtag(
    "consent",
    action,
    {
      ad_user_data: status,
      ad_personalization: status,
      ad_storage: status,
      analytics_storage: status,
    },
  )
}
setGAConsentData("default", "denied")
window.addEventListener("f3cc_consent_granted", () => {
  setGAConsentData("update", "granted")
})
window.addEventListener("f3cc_consent_denied", () => {
  setGAConsentData("update", "denied")
})
