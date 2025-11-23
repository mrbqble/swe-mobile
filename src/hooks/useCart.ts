import { cart } from '../api'
import { useAsync } from './useAsync'
import { useState } from 'react'

type CartData = {
	items: any[]
	totalQty: number
}

export function useCart() {
	const [items, setItems] = useState<any[]>([])
	const [totalQty, setTotalQty] = useState(0)

	const { loading, execute: load } = useAsync<CartData>({
		fn: async () => {
			const res = await (cart as any).getCart()
			return {
				items: res.items || [],
				totalQty: res.totalQty || 0
			}
		},
		onSuccess: (data) => {
			setItems(data.items)
			setTotalQty(data.totalQty)
		}
	})

	const add = async (productId: number | string, qty = 1) => {
		await (cart as any).addToCart(productId, qty)
		await load()
	}

	const remove = async (productId: number | string) => {
		await (cart as any).removeFromCart(productId)
		await load()
	}

	const update = async (productId: number | string, qty: number) => {
		if ((cart as any).updateCartItem) {
			await (cart as any).updateCartItem(productId, qty)
		} else {
			// fallback: if qty <=0 remove, else set by removing and adding
			if (qty <= 0) {
				await (cart as any).removeFromCart(productId)
			} else {
				await (cart as any).removeFromCart(productId)
				await (cart as any).addToCart(productId, qty)
			}
		}
		await load()
	}

	const clear = async () => {
		await (cart as any).clearCart()
		await load()
	}

	return { items, totalQty, loading, load, add, remove, clear, update }
}
