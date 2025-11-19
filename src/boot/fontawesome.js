import { boot } from 'quasar/wrappers'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// Import specific icons you need
import {
  faFacebookF,
  faInstagram,
  faTiktok,
  faXTwitter,
  faTwitter,
  faYoutube,
  faSnapchatGhost,
  faLinkedinIn,
  faPinterest,
  faReddit,
  faWhatsapp,
  faFacebookMessenger,
  faDiscord,
  faTelegram,
  faWeixin,
} from '@fortawesome/free-brands-svg-icons'
// Add icons to library
library.add(
  faFacebookF,
  faInstagram,
  faTiktok,
  faXTwitter,
  faTwitter,
  faYoutube,
  faSnapchatGhost,
  faLinkedinIn,
  faPinterest,
  faReddit,
  faWhatsapp,
  faFacebookMessenger,
  faDiscord,
  faTelegram,
  faWeixin,
)
export default boot(({ app }) => {
  app.component('font-awesome-icon', FontAwesomeIcon)
})
