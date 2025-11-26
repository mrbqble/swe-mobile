import { cart } from '../api'
import { useAsync } from './useAsync'
import { useState, useEffect } from 'react'

type CartData = {
	items: any[]
	totalQty: number
	bySupplier?: Record<string, any[]>
}

export function useCart() {
	const [items, setItems] = useState<any[]>([])
	const [totalQty, setTotalQty] = useState(0)
	const [bySupplier, setBySupplier] = useState<Record<string, any[]>>({})

	const { loading, execute: load, error } = useAsync<CartData>({
		fn: async () => {
			const res = await cart.getCart()
			return {
				items: res.items || [],
				totalQty: res.totalQty || 0,
				bySupplier: res.bySupplier || {}
			}
		},
		onSuccess: (data) => {
			setItems(data.items)
			setTotalQty(data.totalQty)
			setBySupplier(data.bySupplier || {})
		}
	})

	// Load cart on mount
	useEffect(() => {
		load()
	}, [])

	const add = async (productId: number | string, qty = 1, supplierId?: number | string) => {
		try {
			await cart.addToCart(productId, qty, supplierId)
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

	const update = async (productId: number | string, qty: number, supplierId?: number | string) => {
		try {
			await cart.updateCartItem(productId, qty, supplierId)
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

	return { items, totalQty, bySupplier, loading, load, add, remove, clear, update, error }
}
