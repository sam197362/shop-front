<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">購物車</h1>
      </v-col>

      <v-col cols="12">
        <v-list lines="two">
          <v-list-item v-if="cart?.length === 0">
            <v-list-item-title>
              購物車是空的
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-for="(item) in cart"
            :key="item._id"
            :class="{ 'bg-red': !item.product.sell }"
          >
            <template #prepend>
              <v-avatar
                class="cursor-pointer"
                :image="item.product.imageUrl"
                @click="$router.push('/product/'+item.product._id)"
              />
            </template>

            <v-list-item-title>
              {{ item.product.name }}
            </v-list-item-title>

            <v-list-item-subtitle>
              ${{ item.product.price }}
            </v-list-item-subtitle>

            <template #append>
              <v-number-input
                control-variant="split"
                :min="0"
                :model-value="item.quantity"
                variant="outlined"
                @update:model-value="updateCart($event, item.product._id)"
              />
            </template>
          </v-list-item>
        </v-list>

        <p class="text-center">總金額: {{ totalPrice }}</p>

        <div class="w-100 text-center">
          <v-btn color="green" :disabled="checkoutDisable" @click="checkout">結帳</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCreateMutation } from '@/quries/order'
  import { useAddCartMutation, useGetCartQuery } from '@/quries/user'
  import { useSnackbarStore } from '@/stores/snackbar'

  const { data: cart } = useGetCartQuery()
  const snackbar = useSnackbarStore()
  const router = useRouter()
  const { mutateAsync: addCartMutate } = useAddCartMutation()
  const { mutateAsync: createMutate } = useCreateMutation()

  async function updateCart (quantity: number, id: string) {
    try {
      await addCartMutate({
        product: id,
        quantity,
        replace: true,
      })
    } catch (error) {
      snackbar.addError(error)
    }
  }

  const totalPrice = computed(() => {
    return cart.value ? cart.value.reduce((total, item) => total + item.product.price * item.quantity, 0) : 0
  })

  const checkoutDisable = computed(() => {
    return cart.value ? cart.value.length === 0 || cart.value.some(item => !item.product.sell) : false
  })

  async function checkout () {
    try {
      await createMutate()
      router.push('/user/order')
      snackbar.add({ text: '結帳成功', color: 'green' })
    } catch (error) {
      snackbar.addError(error)
    }
  }
</script>

<route lang="yaml">
meta:
  title: 購物車
  login: login-only
  admin: false
</route>
