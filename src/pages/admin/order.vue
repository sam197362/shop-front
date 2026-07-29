<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">訂單管理</h1>
      </v-col>

      <v-col cols="12">
        <v-data-table :headers="headers" :items="orders">
          <template #[`item.cart`]="{ value }">
            <ul>
              <li v-for="item in value" :key="item._id">
                {{ item.product.name }} x {{ item.quantity }}
              </li>
            </ul>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import type { IOrder } from '@/types/order'
  import { useGetAllQuery } from '@/quries/order'

  const { data: orders } = useGetAllQuery()

  const headers = [
    { title: 'ID', key: '_id' },
    { title: '訂購者', key: 'user.account' },
    { title: '建立日期', key: 'createdAt', value: (item: IOrder) => new Date(item.createdAt).toLocaleString() },
    { title: '商品', key: 'cart', sortable: false },
    { title: '總金額', key: 'totalPrice', value: (item: IOrder) => item.cart.reduce((total, item) => total + item.product.price * item.quantity, 0) },
  ]
</script>

<route lang="yaml">
meta:
  layout: admin
  title: 訂單管理
  login: login-only
  admin: true
</route>
