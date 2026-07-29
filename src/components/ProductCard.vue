<template>
  <v-card>
    <v-img cover height="200px" :src="imageUrl" />

    <v-card-title>
      <router-link :to="'/product/' + _id">{{ name }}</router-link>
    </v-card-title>

    <v-card-subtitle>
      {{ category }} / {{ formatedPrice }}
    </v-card-subtitle>

    <v-card-text>{{ description }}</v-card-text>

    <v-card-actions>
      <v-btn
        block
        color="primary"
        prepend-icon="mdi-cart"
        variant="outlined"
        @click="addCart"
      >加入購物車</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { IProduct } from '@/types/product'
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAddCartMutation } from '@/quries/user'
  import { useSnackbarStore } from '@/stores/snackbar'
  import { useUserStore } from '@/stores/user'

  const props = defineProps<IProduct>()

  const user = useUserStore()
  const router = useRouter()
  const snackbar = useSnackbarStore()
  const { mutateAsync: addCartMutate } = useAddCartMutation()

  const formatedPrice = computed(() =>
    new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(props.price),
  )

  async function addCart () {
    try {
      if (!user.isLoggedIn) {
        router.push('/login')
        return
      }
      await addCartMutate({ product: props._id, quantity: 1, replace: false })
      snackbar.add({ text: '加入購物車成功', color: 'green' })
    } catch (error) {
      snackbar.addError(error)
    }
  }
</script>

<style scoped lang="sass">
.v-card-text
  white-space: pre
  height: 100px
  overflow-y: hidden
</style>
