import { cart } from '../api'
import { useAsync } from './useAsync'
import { useState, useEffect } from 'react'

type CartData = {
	items: any[]
	totalQty: number
}

export function useCart() {
	const [items, setItems] = useState<any[]>([])
	const [totalQty, setTotalQty] = useState(0)

	const { loading, execute: load, error } = useAsync<CartData>({
		fn: async () => {
			const res = await cart.getCart()
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

	// Load cart on mount
	useEffect(() => {
		load()
	}, [])

	const add = async (productId: number | string, qty = 1) => {
		try {
			await cart.addToCart(productId, qty)
		await load()
		} catch (err) {
			console.error('Error adding to cart:', err)
			throw err
		}
	}

	const remove = async (productId: number | string) => {
		try {
			await cart.removeFromCart(productId)
		await load()
		} catch (err) {
			console.error('Error removing from cart:', err)
			throw err
		}
	}

	const update = async (productId: number | string, qty: number) => {
		try {
			await cart.updateCartItem(productId, qty)
			await load()
		} catch (err) {
			console.error('Error updating cart item:', err)
			throw err
		}
	}

	const clear = async () => {
		try {
			await cart.clearCart()
		await load()
		} catch (err) {
			console.error('Error clearing cart:', err)
			throw err
		}
	}

	return { items, totalQty, loading, load, add, remove, clear, update, error }
}
