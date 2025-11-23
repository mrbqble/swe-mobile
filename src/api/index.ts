// API exports - all HTTP adapters
import * as CatalogHttp from './catalog.http'
import * as ProductHttp from './product.http'
import * as CartHttp from './cart.http'
import * as LinkedHttp from './linkedSuppliers.http'
import * as SuppliersHttp from './suppliers.http'
import * as OrdersHttp from './orders.http'
import * as ComplaintsHttp from './complaints.http'
import * as AuthHttp from './auth.http'
import * as ChatHttp from './chat.http'

export const catalog = CatalogHttp
export const product = ProductHttp
export const cart = CartHttp
export const linkedSuppliers = LinkedHttp
export const suppliers = SuppliersHttp
export const orders = OrdersHttp
export const complaints = ComplaintsHttp
export const auth = AuthHttp
export const chat = ChatHttp
