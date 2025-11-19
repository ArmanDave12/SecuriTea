<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="custom-header">
      <div class="q-safe-top"></div>
      <q-toolbar class="custom-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="menu-btn"
        />

        <!-- Responsive brand -->
        <div class="brand-container">
          <!-- Tea cup icon with accent -->
          <div class="tea-icon-container">
            <q-icon name="local_cafe" size="24px" class="tea-icon" />
            <!-- Small accent dot -->
            <div class="accent-dot"></div>
          </div>

          <!-- Brand name - full on larger screens, abbreviated on xs -->
          <q-toolbar-title class="gt-xs brand-title" @click="triggerSecret"
            >SecuriTea</q-toolbar-title
          >

          <!-- Shortened brand for tiny screens -->
          <q-toolbar-title class="xs brand-title-small" @click="triggerSecret"
            >SecuriTea</q-toolbar-title
          >
        </div>

        <q-space />

        <!-- User profile section - optimized for mobile -->
        <div v-if="currentUser">
          <!-- On mobile, just show avatar and dropdown -->
          <div class="row items-center no-wrap">
            <!-- User avatar with dropdown menu -->
            <q-btn flat round class="user-btn">
              <q-avatar class="user-avatar" text-color="white" size="28px">
                {{ currentUser.nickname ? currentUser.nickname.charAt(0).toUpperCase() : 'U' }}
              </q-avatar>

              <q-menu class="user-menu">
                <q-list style="min-width: 150px">
                  <!-- Show user info on mobile inside menu -->
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-bold menu-user-name">{{
                        currentUser.nickname
                      }}</q-item-label>
                      <q-item-label caption class="menu-user-status">Logged in</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />

                  <!-- Profile option -->
                  <q-item clickable v-close-popup to="/profile" class="menu-item">
                    <q-item-section avatar>
                      <q-icon name="person" class="menu-icon" />
                    </q-item-section>
                    <q-item-section>Profile</q-item-section>
                  </q-item>

                  <!-- Settings option -->
                  <q-item clickable v-close-popup class="menu-item">
                    <q-item-section avatar>
                      <q-icon name="settings" class="menu-icon" />
                    </q-item-section>
                    <q-item-section>Settings</q-item-section>
                  </q-item>

                  <q-separator />

                  <!-- Logout option -->
                  <q-item clickable v-close-popup @click="handleLogout" class="menu-item">
                    <q-item-section avatar>
                      <q-icon name="logout" class="menu-icon" />
                    </q-item-section>
                    <q-item-section>Logout</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>

        <!-- Login button - simplified for mobile -->
        <div v-else>
          <q-btn
            flat
            :label="$q.screen.gt.xs ? 'Login' : ''"
            icon="login"
            to="/auth/login"
            class="login-btn"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="custom-drawer">
      <q-scroll-area style="height: 100%">
        <!-- App branding in drawer -->
        <div class="row items-center q-pa-md drawer-brand">
          <div class="tea-icon-container-drawer">
            <q-icon name="local_cafe" size="28px" class="tea-icon-drawer" />
            <div class="accent-dot-drawer"></div>
          </div>
          <div class="text-h6 drawer-title">SecuriTea</div>
        </div>

        <q-separator class="custom-separator" />

        <q-list class="custom-list">
          <!-- User profile section in drawer when logged in -->
          <template v-if="currentUser">
            <q-item-label header class="section-header">Account</q-item-label>

            <q-item class="drawer-item">
              <q-item-section avatar>
                <q-avatar class="drawer-avatar">
                  {{ currentUser.nickname ? currentUser.nickname.charAt(0).toUpperCase() : 'U' }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="drawer-user-name">{{ currentUser.nickname }}</q-item-label>
                <q-item-label caption class="drawer-user-status">Logged in</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable to="/profile" class="drawer-item clickable-item">
              <q-item-section avatar>
                <q-icon name="person" class="drawer-icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>My Profile</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="custom-separator" />
          </template>

          <q-item-label header class="section-header">Navigation</q-item-label>

          <!-- Dashboard link -->
          <q-item clickable to="/" class="drawer-item clickable-item">
            <q-item-section avatar>
              <q-icon name="dashboard" class="drawer-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Security Check link -->
          <q-item clickable class="drawer-item clickable-item">
            <q-item-section avatar>
              <q-icon name="security" class="drawer-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Security Check</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Settings link -->
          <q-item clickable class="drawer-item clickable-item">
            <q-item-section avatar>
              <q-icon name="settings" class="drawer-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Resources section -->
          <q-separator class="custom-separator" />
          <q-item-label header class="section-header">Resources</q-item-label>

          <q-item clickable class="drawer-item clickable-item">
            <q-item-section avatar>
              <q-icon name="help" class="drawer-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Help & Support</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable class="drawer-item clickable-item">
            <q-item-section avatar>
              <q-icon name="info" class="drawer-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>About</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Add logout link to drawer if user is logged in -->
          <template v-if="currentUser">
            <q-separator class="custom-separator" />

            <q-item clickable @click="handleLogout" class="drawer-item clickable-item logout-item">
              <q-item-section avatar>
                <q-icon name="logout" class="drawer-icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import useAuth from 'src/composables/useAuth'

const $q = useQuasar()
const router = useRouter()
const { getCurrentUser, logout } = useAuth()
const currentUser = ref(null)
const leftDrawerOpen = ref(false)
const secretCount = ref(0)
let secretTimeout = null

// Check for user on component mount
onMounted(() => {
  // Get current user from auth composable
  currentUser.value = getCurrentUser()

  // Close drawer by default on mobile
  if ($q.screen.lt.sm) {
    leftDrawerOpen.value = false
  }
})

const triggerSecret = () => {
  secretCount.value++
  console.log(secretCount.value)
  if (secretTimeout) clearTimeout(secretTimeout)

  // Reset after 1.2 seconds
  secretTimeout = setTimeout(() => {
    secretCount.value = 0
  }, 1200)

  if (secretCount.value >= 7) {
    secretCount.value = 0
    goToSecret()
  }
}

const goToSecret = () => {
  console.log('Attempting to navigate to secret page...')

  try {
    // Try named route first
    router
      .push({ name: 'secret' })
      .then(() => {
        console.log('Navigation successful via named route')
      })
      .catch((error) => {
        console.error('Named route failed:', error)
        // Fallback to path-based navigation
        router
          .push('/secret')
          .then(() => {
            console.log('Navigation successful via path')
          })
          .catch((pathError) => {
            console.error('Path-based navigation also failed:', pathError)
            // Last resort - manual navigation
            window.location.href = '/secret'
          })
      })
  } catch (error) {
    console.error('Navigation error:', error)
    // Direct path fallback
    router.push('/secret')
  }
}
// Toggle drawer function
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Logout handler
function handleLogout() {
  logout()
  currentUser.value = null
  // Redirect to login page after logout
  router.push('/')

  // Close drawer after logout on mobile
  if ($q.screen.lt.sm) {
    leftDrawerOpen.value = false
  }
}
</script>

<style lang="scss" scoped>
/* SecuriTea Color Scheme */
.custom-header {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-toolbar {
  color: white;
}

.brand-container {
  display: flex;
  align-items: center;
}

.tea-icon-container {
  position: relative;
  margin-right: 8px;
}

.tea-icon {
  color: white !important;
}

.accent-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fb923c;
  border-radius: 50%;
  top: -2px;
  right: -2px;
  opacity: 0.8;
}

.brand-title,
.brand-title-small {
  font-weight: 700;
  letter-spacing: 0.5px;
  color: white !important;
}

.menu-btn {
  color: white !important;
}

.menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-btn {
  color: white !important;
}

.user-avatar {
  background: linear-gradient(135deg, #65a30d 0%, #fb923c 100%) !important;
}

.login-btn {
  color: white !important;
}

.login-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Drawer Styling */
.custom-drawer {
  background-color: #f8f9fa;
  border-right: 1px solid #94a3b8;
}

.drawer-brand {
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%);
  border-bottom: 1px solid #94a3b8;
}

.tea-icon-container-drawer {
  position: relative;
  margin-right: 12px;
}

.tea-icon-drawer {
  color: #008080 !important;
}

.accent-dot-drawer {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #fb923c;
  border-radius: 50%;
  top: -2px;
  right: -2px;
  opacity: 0.8;
}

.drawer-title {
  color: #008080 !important;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.custom-separator {
  background-color: #94a3b8;
}

.section-header {
  color: #475569 !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.drawer-item {
  color: #475569 !important;
  border-radius: 8px;
  margin: 2px 8px;
}

.clickable-item:hover {
  background-color: rgba(0, 128, 128, 0.1) !important;
  color: #008080 !important;
}

.drawer-avatar {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  color: white !important;
}

.drawer-user-name {
  color: #475569 !important;
  font-weight: 600;
}

.drawer-user-status {
  color: #64748b !important;
}

.drawer-icon {
  color: #64748b !important;
}

.clickable-item:hover .drawer-icon {
  color: #008080 !important;
}

.logout-item:hover {
  background-color: rgba(239, 68, 68, 0.1) !important;
  color: #dc2626 !important;
}

.logout-item:hover .drawer-icon {
  color: #dc2626 !important;
}

/* Menu Styling */
.user-menu {
  border: 1px solid #94a3b8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-user-name {
  color: #475569 !important;
}

.menu-user-status {
  color: #64748b !important;
}

.menu-item:hover {
  background-color: rgba(0, 128, 128, 0.1) !important;
  color: #008080 !important;
}

.menu-icon {
  color: #64748b !important;
}

.menu-item:hover .menu-icon {
  color: #008080 !important;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  :deep(.q-toolbar) {
    min-height: 48px;
    padding: 0 8px;

    .q-btn {
      padding: 6px;
    }
  }

  :deep(.q-toolbar__title) {
    font-size: 1.1rem;
    padding: 0 8px;
  }
}

@media (max-width: 320px) {
  :deep(.q-toolbar) {
    min-height: 44px;
    padding: 0 4px;

    .q-btn {
      padding: 4px;
      margin: 0 2px;
    }
  }

  .brand-title-small {
    font-size: 1rem;
    padding: 0 4px;
  }
}
</style>
