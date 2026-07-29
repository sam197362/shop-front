<template>
  <v-navigation-drawer permanent>
    <v-list>
      <v-list-item :title="user.account">
        <template #prepend>
          <v-avatar>
            <Avatar
              :colors="['#b5f4bc','#fff19e','#ffdc8a','#ffba6b','#ff6543']"
              :name="user.account"
              :size="40"
              variant="beam"
            />
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list>
      <v-list-item
        v-for="nav in navs"
        :key="nav.to"
        :prepend-icon="nav.icon"
        :title="nav.title"
        :to="nav.to"
      />
    </v-list>
  </v-navigation-drawer>

  <v-main>
    <router-view />
  </v-main>
</template>

<script setup lang="ts">
  import Avatar from 'vue-boring-avatars'
  import { useUserStore } from '@/stores/user'

  const user = useUserStore()

  const navs = [
    { title: '商品管理', to: '/admin/product', icon: 'mdi-shopping' },
    { title: '訂單管理', to: '/admin/order', icon: 'mdi-list-box-outline' },
    { title: '回首頁', to: '/', icon: 'mdi-home' },
  ]
</script>
