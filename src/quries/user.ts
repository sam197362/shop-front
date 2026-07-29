import type { CartForm, ICartItem } from '@/types/user'
import { defineMutation, defineQuery, useMutation, useQuery, useQueryCache } from '@pinia/colada'
import * as user from '@/services/user'
import { useUserStore } from '@/stores/user'

// 快取保留時間 5 分鐘
const STALE_TIME = 1000 * 60 * 5

export const useAddCartMutation = defineMutation(() => {
  return useMutation({
    mutation: (data: CartForm) => user.addCart(data),
    onSuccess: (response, vars) => {
      // 更新導覽列顯示的購物車數量
      const user = useUserStore()
      user.cart = response.data.result
      // 取得購物車快取
      const queryCache = useQueryCache()
      const currentCart = queryCache.getQueryData<ICartItem[]>(['cart'])
      if (!currentCart) {
        return
      }
      // 更新購物車快取的內容
      const newCart = [...currentCart]
      const idx = newCart.findIndex(item => item.product._id === vars.product)
      if (idx === -1) {
        // 新增的商品不再購物車內，標記快取過期以取得商品資訊
        queryCache.invalidateQueries({ key: ['cart'] })
      } else {
        // 更新購物車快取
        if (vars.replace) {
          newCart[idx].quantity = vars.quantity
        } else {
          newCart[idx].quantity += vars.quantity
        }
        if (newCart[idx].quantity === 0) {
          newCart.splice(idx, 1)
        }
        // 設定購物車快取
        queryCache.setQueryData(['cart'], newCart)
      }
    },
  })
})

export const useGetCartQuery = defineQuery(() => {
  return useQuery({
    // key 定義快取資料名稱
    key: ['cart'],
    // 查詢方式
    query: async () => {
      const { data } = await user.getCart()
      return data.result
    },
    // 快取保留時間
    staleTime: STALE_TIME,
  })
})
