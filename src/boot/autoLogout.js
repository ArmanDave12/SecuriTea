// import { boot } from 'quasar/wrappers'
// import { App } from '@capacitor/app'

// export default boot(() => {
//   // When app goes to background / minimized
//   App.addListener('pause', () => {
//     console.log('[AUTO LOGOUT] App paused → logout')
//     localStorage.removeItem('loggedInUser')
//   })

//   // When app is opened again
//   App.addListener('resume', () => {
//     console.log('[AUTO LOGOUT] App resumed → redirect to login')
//     window.location.href = '/login'
//   })

//   // When app is closed / inactive
//   App.addListener('appStateChange', (state) => {
//     if (!state.isActive) {
//       console.log('[AUTO LOGOUT] App closed → logout')
//       localStorage.removeItem('loggedInUser')
//     }
//   })
// })
