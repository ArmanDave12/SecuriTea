<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <!-- Responsive brand -->
        <div class="brand-container">
          <!-- Tea cup icon -->
          <q-icon name="emoji_food_beverage" size="24px" class="q-mr-sm tea-icon" />

          <!-- Brand name - full on larger screens, abbreviated on xs -->
          <q-toolbar-title class="gt-xs brand-title"> SecuriTea </q-toolbar-title>

          <!-- Shortened brand for tiny screens -->
          <q-toolbar-title class="xs brand-title-small"> S-Tea </q-toolbar-title>
        </div>

        <q-space />

        <!-- User profile section - optimized for mobile -->
        <div v-if="currentUser">
          <!-- On mobile, just show avatar and dropdown -->
          <div class="row items-center no-wrap">
            <!-- User avatar with dropdown menu -->
            <q-btn flat round>
              <q-avatar color="secondary" text-color="white" size="28px">
                {{ currentUser.nickname ? currentUser.nickname.charAt(0).toUpperCase() : 'U' }}
              </q-avatar>

              <q-menu>
                <q-list style="min-width: 150px">
                  <!-- Show user info on mobile inside menu -->
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{
                        currentUser.nickname
                      }}</q-item-label>
                      <q-item-label caption>Logged in</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />

                  <!-- Profile option -->
                  <q-item clickable v-close-popup to="/profile">
                    <q-item-section avatar>
                      <q-icon name="person" />
                    </q-item-section>
                    <q-item-section>Profile</q-item-section>
                  </q-item>

                  <!-- Settings option -->
                  <q-item clickable v-close-popup>
                    <q-item-section avatar>
                      <q-icon name="settings" />
                    </q-item-section>
                    <q-item-section>Settings</q-item-section>
                  </q-item>

                  <q-separator />

                  <!-- Logout option -->
                  <q-item clickable v-close-popup @click="handleLogout">
                    <q-item-section avatar>
                      <q-icon name="logout" />
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
          <q-btn flat :label="$q.screen.gt.xs ? 'Login' : ''" icon="login" to="/auth/login" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area style="height: 100%">
        <!-- App branding in drawer -->
        <div class="row items-center q-pa-md">
          <q-icon name="emoji_food_beverage" size="28px" class="q-mr-sm tea-icon" />
          <div class="text-h6">SecuriTea</div>
        </div>

        <q-separator />

        <q-list>
          <!-- User profile section in drawer when logged in -->
          <template v-if="currentUser">
            <q-item-label header class="text-grey-8"> Account </q-item-label>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="secondary">
                  {{ currentUser.nickname ? currentUser.nickname.charAt(0).toUpperCase() : 'U' }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ currentUser.nickname }}</q-item-label>
                <q-item-label caption>Logged in</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable to="/profile">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>My Profile</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />
          </template>

          <q-item-label header> Navigation </q-item-label>

          <!-- Dashboard link -->
          <q-item clickable to="/">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Security Check link -->
          <q-item clickable>
            <q-item-section avatar>
              <q-icon name="security" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Security Check</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Settings link -->
          <q-item clickable>
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Resources section -->
          <q-separator />
          <q-item-label header> Resources </q-item-label>

          <q-item clickable>
            <q-item-section avatar>
              <q-icon name="help" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Help & Support</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable>
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>
              <q-item-label>About</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Add logout link to drawer if user is logged in -->
          <template v-if="currentUser">
            <q-separator />

            <q-item clickable @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
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

// Check for user on component mount
onMounted(() => {
  // Get current user from auth composable
  currentUser.value = getCurrentUser()

  // Close drawer by default on mobile
  if ($q.screen.lt.sm) {
    leftDrawerOpen.value = false
  }
})

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
.brand-container {
  display: flex;
  align-items: center;
}

.tea-icon {
  color: #ffcc80; /* Light orange color for tea */
}

.brand-title,
.brand-title-small {
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Add custom styles here */
// Force smaller padding in toolbar on mobile
@media (max-width: 599px) {
  :deep(.q-toolbar) {
    min-height: 48px;
    padding: 0 8px;

    .q-btn {
      padding: 6px;
    }
  }

  // Reduce size of toolbar items
  :deep(.q-toolbar__title) {
    font-size: 1.1rem;
    padding: 0 8px;
  }
}

// Specifically for very small screens (320px)
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
