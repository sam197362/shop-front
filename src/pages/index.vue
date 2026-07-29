<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="search.text"
          append-inner-icon="mdi-magnify"
          hide-details
          label="搜尋商品"
          variant="outlined"
        />
      </v-col>

      <v-col cols="6">
        <v-select
          v-model="search.sort"
          hide-details
          item-title="text"
          :items="sortOptions"
          label="排序方式"
          return-object
          variant="outlined"
        />
      </v-col>

      <v-col cols="12">
        <v-chip-group v-model="search.categories" multiple>
          <v-chip
            v-for="option in categoryOptions"
            :key="option"
            filter
            selected-class="text-primary"
            :text="option"
            :value="option"
            variant="outlined"
          />
        </v-chip-group>

      </v-col>
    </v-row>

    <v-data-iterator :items="filteredProducts" :items-per-page="3" :page="page">
      <template #default="{ items }">
        <v-row>
          <v-col
            v-for="(item, i) in items"
            :key="i"
            cols="12"
            lg="3"
            md="6"
          >
            <product-card v-bind="item.raw" />
          </v-col>
        </v-row>
      </template>

      <template #footer="{ pageCount }">
        <v-pagination v-model="page" :length="pageCount" />
      </template>
    </v-data-iterator>

    <v-row />
  </v-container>
</template>

<script setup lang="ts">
  import type { IProduct, TCategoryOptions } from '@/types/product'
  import { computed, ref } from 'vue'
  import ProductCard from '@/components/ProductCard.vue'
  import { useGetQuery } from '@/quries/product'

  const { data: products } = useGetQuery()

  const page = ref(1)

  const filteredProducts = computed<IProduct[]>(() => {
    if (!products.value) return []
    return products.value
      .filter(product => {
        const match = product.name.toLowerCase().includes(search.value.text.toLowerCase())
        const categoryMatch = search.value.categories.length === 0 || search.value.categories.includes(product.category)
        return match && categoryMatch
      })
      .toSorted((a: IProduct, b: IProduct) => {
        const key = search.value.sort.key
        const direction = search.value.sort.direction
        // 假設
        // key = price
        // a.price = 80
        // b.price = 100
        // 實際運作
        // direction : 1 時
        // 80 > 100 --> x --> -1 * direction --> -1 --> a 在前
        // direction : -1 時
        // 80 > 100 --> x --> -1 * direction --> 1 --> b 在前
        return a[key] > b[key] ? direction : -1 * direction
      })
  })

  interface Sort {
    text: string
    key: keyof IProduct
    direction: 1 | -1
  }

  const search = ref<{
    text: string
    categories: TCategoryOptions[]
    sort: Sort
  }>({
    text: '',
    categories: [],
    sort: {
      text: '名稱',
      key: 'name',
      direction: 1,
    },
  })

  const categoryOptions = ['3C', '食品', '衣服']
  const sortOptions: Sort[] = [
    { text: '名稱', key: 'name', direction: 1 },
    { text: '價格: 低到高', key: 'price', direction: 1 },
    { text: '價格: 高到低', key: 'price', direction: -1 },
  ]
</script>

<route lang="yaml">
meta:
  title: 購物網站
</route>
