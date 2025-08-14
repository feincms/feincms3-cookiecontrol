window.dataLayer = window.dataLayer || []
function gtag() {
  // biome-ignore lint/complexity/noArguments: arguments is fine here.
  window.dataLayer.push(arguments)
}
gtag("consent", "default", {
  ad_user_data: "granted",
  ad_personalization: "granted",
  ad_storage: "granted",
  analytics_storage: "granted",
})
