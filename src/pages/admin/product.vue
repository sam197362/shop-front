<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-center">商品管理</h1>
      </v-col>

      <v-col cols="12">
        <v-data-table
          :filter-keys="filterKeys"
          :headers="headers"
          :items="products"
          :loading="isLoading"
          :search="search"
        >
          <template #[`item.imageUrl`]="{ value }">
            <v-img aspect-ratio="1/1" :src="value" width="40" />
          </template>

          <template #[`item.sell`]="{ value }">
            <v-icon v-if="value" icon="mdi-check" />
          </template>

          <template #[`item.action`]="{ item }">
            <v-btn icon="mdi-pencil" @click="openDialog(item)" />
          </template>

          <template #top>
            <v-toolbar class="px-3" flat>
              <v-text-field
                v-model="search"
                density="compact"
                flat
                hide-details
                placeholder="搜尋商品"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
              />

              <v-spacer />
              <v-btn prepend-icon="mdi-plus" variant="outlined" @click="openDialog(null)">新增商品</v-btn>
            </v-toolbar>

          </template>
        </v-data-table>

        <v-dialog v-model="dialog.open" max-width="600" persistent>
          <v-form :disabled="isSubmitting" @submit.prevent="submit">
            <v-card :title="dialog.id ? '編輯商品' : '新增商品'">

              <v-card-text>
                <v-text-field
                  v-model="name"
                  :error-messages="errors.name"
                  label="名稱"
                />

                <v-text-field
                  v-model="price"
                  :error-messages="errors.price"
                  label="價格"
                  min="0"
                  type="number"
                />

                <v-textarea
                  v-model="description"
                  :error-messages="errors.description"
                  label="說明"
                  rows="5"
                />

                <v-select
                  v-model="category"
                  :error-messages="errors.category"
                  :items="categoryOptions"
                  label="分類"
                />

                <v-checkbox
                  v-model="sell"
                  :error-messages="errors.sell"
                  label="上架"
                />

                <vue-file-agent
                  ref="fileAgent"
                  v-model="fileRecords"
                  v-model:raw-model-value="rawFileRecords"
                  accept="image/png,image/jpeg"
                  deletable
                  :error-text="{ type: '檔案類型無效', size: '文件大小不應超過 1MB' }"
                  help-text="選擇檔案或將檔案拖曳到此處"
                  :max-files="1"
                  max-size="1MB"
                />
              </v-card-text>

              <v-divider />

              <v-card-actions>
                <v-spacer />
                <v-btn :loading="isSubmitting" variant="plain" @click="closeDialog">取消</v-btn>
                <v-btn color="primary" :loading="isSubmitting" type="submit" variant="flat">送出</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import type { IProduct, TCategoryOptions } from '@/types/product'
  import { useForm } from 'vee-validate'
  import { ref, useTemplateRef } from 'vue'
  import * as yup from 'yup'
  import { useCreateMutation, useGetAllQuery, useUpdateMutation } from '@/quries/product'
  import { useSnackbarStore } from '@/stores/snackbar'

  const fileAgent = useTemplateRef('fileAgent')

  const snackbar = useSnackbarStore()
  const { mutateAsync: createMutate } = useCreateMutation()
  const { mutateAsync: updateMutate } = useUpdateMutation()

  const { data: products, isLoading } = useGetAllQuery()

  const headers = [
    { title: 'ID', key: '_id' },
    { title: '圖片', key: 'imageUrl', sortable: false },
    { title: '名稱', key: 'name' },
    { title: '價格', key: 'price' },
    { title: '分類', key: 'category' },
    { title: '說明', key: 'description' },
    { title: '上架', key: 'sell' },
    { title: '建立日期', key: 'createdAt', value: (item: any) => new Date(item.createdAt).toLocaleString() },
    { title: '修改日期', key: 'updatedAt', value: (item: any) => new Date(item.updatedAt).toLocaleString() },
    { title: '操作', key: 'action', sortable: false },
  ]

  const search = ref('')
  const filterKeys = ['_id', 'name', 'price', 'category', 'description', 'createdAt', 'updatedAt']

  const dialog = ref({
    open: false,
    id: '',
  })

  const categoryOptions = ['3C', '食品', '衣服']
  const schema = yup.object({
    name: yup.string().typeError('資料格式錯誤').required('名稱必填'),
    price: yup.number().typeError('資料格式錯誤').required('價格必填').min(0, '價格錯誤'),
    description: yup.string().typeError('資料格式錯誤').required('說明必填'),
    category: yup
      .string()
      .typeError('資料格式錯誤')
      .required('分類必填')
      .oneOf(categoryOptions, '分類錯誤'),
    sell: yup.boolean().typeError('資料格式錯誤').required('上下架必填'),
  })
  const { defineField, errors, isSubmitting, resetForm, handleSubmit } = useForm({
    validationSchema: schema,
    initialValues: {
      name: '',
      price: 0,
      description: '',
      category: '',
      sell: false,
    },
  })
  const [name] = defineField('name')
  const [price] = defineField('price')
  const [description] = defineField('description')
  const [category] = defineField('category')
  const [sell] = defineField('sell')
  const fileRecords = ref<any[]>([])
  const rawFileRecords = ref<any[]>([])

  function openDialog (item: IProduct | null) {
    resetForm()
    if (item) {
      dialog.value.id = item._id
      name.value = item.name
      price.value = item.price
      description.value = item.description
      category.value = item.category
      sell.value = item.sell
    } else {
      dialog.value.id = ''
    }
    dialog.value.open = true
  }

  function closeDialog () {
    fileAgent.value.deleteFileRecord()
    dialog.value.open = false
  }

  const submit = handleSubmit(async values => {
    // 如果有選檔案，確認沒有錯誤
    if (fileRecords.value[0]?.error) {
      snackbar.add({ text: '檔案格式錯誤', color: 'red' })
      return
    }
    // 新增必須要有圖片
    // 編輯不一定有，沒有就是沿用
    if (!dialog.value.id && fileRecords.value.length === 0) {
      snackbar.add({ text: '缺少圖片', color: 'red' })
      return
    }

    try {
      const data = {
        ...values,
        category: values.category as TCategoryOptions,
        image: fileRecords.value[0]?.file,
      }
      await (dialog.value.id
        ? updateMutate({ id: dialog.value.id, data })
        : createMutate(data)
      )

      snackbar.add({ text: '儲存成功', color: 'green' })
      closeDialog()
    } catch (error) {
      snackbar.addError(error)
    }
  })
</script>

<route lang="yaml">
meta:
  layout: admin
  title: 商品管理
  login: login-only
  admin: true
</route>
