<template>
  <!-- product 在收到資料前都是 null -->
  <v-container v-if="product">
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">
          {{ product.name }}
        </h1>

        <v-img cover height="200" :src="product.imageUrl" />
        <p>{{ product.description }}</p>
      </v-col>

      <v-col cols="12">
        <v-select v-model="quantity" :items="quantityOptions" label="選擇數量" variant="outlined" />

        <v-btn
          block
          color="primary"
          prepend-icon="mdi-cart"
          variant="outlined"
          @click="addCart"
        >加入購物車</v-btn>
      </v-col>
    </v-row>
  </v-container>

  <v-overlay
    v-if="product"
    class="justify-center text-center align-center"
    :model-value="!product.sell"
    opacity="0.7"
    persistent
  >
    <h1>已下架</h1>
    <v-btn color="primary" to="/">回首頁</v-btn>
  </v-overlay>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useGetIdQuery } from '@/quries/product'
  import { useAddCartMutation } from '@/quries/user'
  import { useSnackbarStore } from '@/stores/snackbar'
  import { useUserStore } from '@/stores/user'

  const quantity = ref(1)
  const quantityOptions = Array.from({ length: 20 }, (value, idx) => idx + 1)

  const router = useRouter()
  const user = useUserStore()
  const snackbar = useSnackbarStore()
  const { mutateAsync: addCartMutate } = useAddCartMutation()

  const { data: product, error } = useGetIdQuery()
  // 偵測 query 失敗做處理
  // https://github.com/posva/pinia-colada/issues/309
  watch(error, e => {
    if (e) {
      router.push('/')
    }
  })
  watch(product, () => {
    if (product.value) {
      document.title = product.value.name
    }
  }, { immediate: true })

  async function addCart () {
    try {
      if (!user.isLoggedIn) {
        router.push('/login')
        return
      }
      await addCartMutate({ product: product.value!._id, quantity: quantity.value, replace: false })
      snackbar.add({ text: '加入購物車成功', color: 'green' })
    } catch (error) {
      snackbar.addError(error)
    }
  }
</script>

<style scoped lang="sass">
p
  white-space: pre
</style>

<route lang="yaml">
meta:
  title: 商品
</route>
