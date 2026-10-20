export const cookieName = "f3cc"
export const sAll = "all"
export const sEssential = "essential"

const cookieRe = new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`)
export const getCookie = () => {
  // The values written by setCookie() never need decoding; decoding values
  // set by somebody else could throw a URIError and abort everything.
  const match = document.cookie.match(cookieRe)
  return match?.[1]
}
