<template>
  <v-app-bar>
    <v-container class="d-flex align-center">
      <v-app-bar-title>購物網站</v-app-bar-title>

      <template v-for="nav in navs" :key="nav.to">
        <v-btn v-if="nav.show" :prepend-icon="nav.icon" :to="nav.to">
          {{ nav.title }}
          <v-badge v-if="nav.to === '/user/cart'" color="red" :content="user.cart" floating />
        </v-btn>
      </template>

      <v-btn v-if="user.isLoggedIn" prepend-icon="mdi-logout" @click="logout">登出</v-btn>
    </v-container>
  </v-app-bar>

  <v-main>
    <router-view :key="$route.fullPath" />
  </v-main>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useLogoutMutation } from '@/quries/auth'
  import { useSnackbarStore } from '@/stores/snackbar'
  import { useUserStore } from '@/stores/user'

  const user = useUserStore()
  const router = useRouter()
  const snackbar = useSnackbarStore()
  const { mutateAsync: logoutMutate } = useLogoutMutation()

  const navs = computed(() => [
    { title: '首頁', to: '/', icon: 'mdi-home', show: true },
    { title: '註冊', to: '/register', icon: 'mdi-account-plus', show: !user.isLoggedIn },
    { title: '登入', to: '/login', icon: 'mdi-login', show: !user.isLoggedIn },
    { title: '購物車', to: '/user/cart', icon: 'mdi-cart', show: user.isLoggedIn },
    { title: '訂單', to: '/user/order', icon: 'mdi-list-box-outline', show: user.isLoggedIn },
    { title: '管理', to: '/admin', icon: 'mdi-cog', show: user.isLoggedIn && user.isAdmin },
  ])

  async function logout () {
    await logoutMutate()
    router.push('/')
    snackbar.add({ text: '登出成功', color: 'green' })
  }
</script>
