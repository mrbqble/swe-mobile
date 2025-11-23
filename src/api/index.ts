// Simple API adapter chooser. Set `USE_MOCK=true` to use in-memory mocks for UI-only development.
import Config from '../config'

const { USE_MOCK } = Config

import * as CatalogMock from './catalog.mock'
import * as CatalogHttp from './catalog.http'
import * as ProductMock from './product.mock'
import * as ProductHttp from './product.http'
import * as CartMock from './cart.mock'
import * as CartHttp from './cart.http'
import * as LinkedMock from './linkedSuppliers.mock'
import * as LinkedHttp from './linkedSuppliers.http'
import * as SuppliersMock from './suppliers.mock'
import * as SuppliersHttp from './suppliers.http'
import * as OrdersMock from './orders.mock'
import * as OrdersHttp from './orders.http'
import * as ComplaintsMock from './complaints.mock'
import * as ComplaintsHttp from './complaints.http'
import * as AuthMock from './auth.mock'
import * as AuthHttp from './auth.http'
import * as ChatMock from './chat.mock'
import * as ChatHttp from './chat.http'

export const catalog = USE_MOCK ? CatalogMock : CatalogHttp
export const product = USE_MOCK ? ProductMock : ProductHttp
export const cart = USE_MOCK ? CartMock : CartHttp
export const linkedSuppliers = USE_MOCK ? LinkedMock : LinkedHttp
export const suppliers = USE_MOCK ? SuppliersMock : SuppliersHttp
export const orders = USE_MOCK ? OrdersMock : OrdersHttp
export const complaints = USE_MOCK ? ComplaintsMock : ComplaintsHttp
export const auth = USE_MOCK ? AuthMock : AuthHttp
export const chat = USE_MOCK ? ChatMock : ChatHttp
