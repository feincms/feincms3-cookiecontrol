window.addEventListener("f3cc_consent_granted", () => {
  updateGAConsentData("granted")
})
window.addEventListener("f3cc_consent_denied", () => {
  updateGAConsentData("denied")
})
const updateGAConsentData = (status) => {
  const dataLayer = (window.dataLayer = window.dataLayer || [])
  dataLayer.push([
    "consent",
    "update",
    {
      ad_user_data: status,
      ad_personalization: status,
      ad_storage: status,
      analytics_storage: status,
    },
  ])
}
