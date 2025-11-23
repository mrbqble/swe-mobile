/**
 * Centralized translations for the mobile app.
 * All translations are organized by module/screen.
 */

export type Language = 'en' | 'ru'

export type Translations = {
	[key: string]: {
		[key: string]: {
			[key: string]: {
				[key: string]: string
			}
		}
	}
}

export const translations = {
	auth: {
		signIn: {
			en: {
				signIn: 'Sign In',
				email: 'Email',
				password: 'Password',
				continue: 'Continue',
				consumer: 'Consumer',
				supplier: 'Supplier',
				selectRole: 'Select your role',
				emailPlaceholder: 'Enter your email',
				passwordPlaceholder: 'Enter your password'
			},
			ru: {
				signIn: 'Вход',
				email: 'Email',
				password: 'Пароль',
				continue: 'Продолжить',
				consumer: 'Потребитель',
				supplier: 'Поставщик',
				selectRole: 'Выберите роль',
				emailPlaceholder: 'Введите email',
				passwordPlaceholder: 'Введите пароль'
			}
		},
		register: {
			en: {
				title: 'Register',
				name: 'Full name',
				email: 'Email',
				password: 'Password',
				register: 'Create account',
				haveAccount: 'Already have an account? Sign in'
			},
			ru: {
				title: 'Регистрация',
				name: 'Полное имя',
				email: 'Email',
				password: 'Пароль',
				register: 'Зарегистрироваться',
				haveAccount: 'Если у Вас есть аккаунт? Войдите вход'
			}
		}
	},
	consumer: {
		home: {
			en: {
				welcome: 'Welcome back!',
				quickActions: 'Quick Actions',
				requestLink: 'Request Link',
				viewCatalog: 'View Catalog',
				myOrders: 'My Orders',
				requestLinkDesc: 'Connect with new suppliers',
				viewCatalogDesc: 'Browse products',
				myOrdersDesc: 'Track your orders',
				home: 'Home',
				suppliers: 'Suppliers',
				catalog: 'Catalog',
				orders: 'Orders',
				profile: 'Profile'
			},
			ru: {
				welcome: 'Добро пожаловать!',
				quickActions: 'Быстрые действия',
				requestLink: 'Запросить связь',
				viewCatalog: 'Просмотр каталога',
				myOrders: 'Мои заказы',
				requestLinkDesc: 'Подключиться к новым поставщикам',
				viewCatalogDesc: 'Просмотр товаров',
				myOrdersDesc: 'Отследить заказы',
				home: 'Главная',
				suppliers: 'Поставщики',
				catalog: 'Каталог',
				orders: 'Заказы',
				profile: 'Профиль'
			}
		},
		cart: {
			en: {
				cart: 'Cart',
				total: 'Total',
				delivery: 'Delivery Method',
				clear: 'Clear',
				placeOrder: 'Place Order'
			},
			ru: {
				cart: 'Корзина',
				total: 'Итого',
				delivery: 'Способ доставки',
				clear: 'Очистить',
				placeOrder: 'Оформить заказ'
			}
		},
		catalog: {
			en: {
				catalog: 'Catalog',
				search: 'Search products...',
				inStock: 'In Stock',
				outOfStock: 'Out of Stock',
				currency: '₸'
			},
			ru: {
				catalog: 'Каталог',
				search: 'Поиск товаров...',
				inStock: 'В наличии',
				outOfStock: 'Нет в наличии',
				currency: '₸'
			}
		},
		orders: {
			en: {
				orders: 'Orders',
				loading: 'Loading...',
				orderPrefix: 'Order #',
				items: 'items'
			},
			ru: {
				orders: 'Заказы',
				loading: 'Загрузка...',
				orderPrefix: 'Заказ №',
				items: 'товаров'
			}
		},
		orderDetail: {
			en: {
				orderDetail: 'Order Details',
				loading: 'Loading...',
				order: 'Order',
				supplier: 'Supplier',
				date: 'Date',
				status: 'Status',
				timeline: 'Timeline',
				orderCreated: 'Order Created',
				total: 'Total',
				qty: 'Qty'
			},
			ru: {
				orderDetail: 'Детали заказа',
				loading: 'Загрузка...',
				order: 'Заказ',
				supplier: 'Поставщик',
				date: 'Дата',
				status: 'Статус',
				timeline: 'Хронология',
				orderCreated: 'Заказ создан',
				total: 'Итого',
				qty: 'Кол-во'
			}
		},
		productDetail: {
			en: {
				inStock: 'In Stock',
				outOfStock: 'Out of stock',
				specs: 'Specifications',
				quantity: 'Quantity',
				add: 'Add to Order',
				back: 'Back to catalog'
			},
			ru: {
				inStock: 'В наличии',
				outOfStock: 'Нет в наличии',
				specs: 'Характеристики',
				quantity: 'Количество',
				add: 'Добавить в заказ',
				back: 'Назад в каталог'
			}
		},
		profile: {
			en: {
				profile: 'Profile',
				personalInformation: 'Personal Information',
				name: 'Name',
				organization: 'Organization',
				email: 'Email',
				settings: 'Settings',
				languageLabel: 'Language',
				logout: 'Logout',
				english: 'English',
				russian: 'Русский'
			},
			ru: {
				profile: 'Профиль',
				personalInformation: 'Личная информация',
				name: 'Имя',
				organization: 'Организация',
				email: 'Эл. почта',
				settings: 'Настройки',
				languageLabel: 'Язык',
				logout: 'Выйти',
				english: 'English',
				russian: 'Русский'
			}
		},
		requestLink: {
			en: {
				requestLink: 'Request Link',
				searchSuppliers: 'Search Suppliers',
				placeholder: 'Enter supplier name or company',
				submitRequest: 'Submit Request',
				loading: 'Loading...'
			},
			ru: {
				requestLink: 'Запрос связи',
				searchSuppliers: 'Поиск поставщиков',
				placeholder: 'Введите название поставщика или компании',
				submitRequest: 'Отправить запрос',
				loading: 'Загрузка...'
			}
		},
		suppliers: {
			en: {
				linkedSuppliers: 'Linked Suppliers',
				loading: 'Loading...',
				products: 'products'
			},
			ru: {
				linkedSuppliers: 'Связанные поставщики',
				loading: 'Загрузка...',
				products: 'товаров'
			}
		}
	},
	supplier: {
		home: {
			en: {
				welcome: 'Welcome back!',
				supplierName: 'TechPro Supply',
				revenue: 'Monthly Revenue',
				currency: '₸',
				pendingRequests: 'Pending Link Requests',
				openOrders: 'Open Orders',
				complaints: 'Active Complaints',
				viewAll: 'View All',
				requests: 'requests',
				orders: 'orders',
				issues: 'issues'
			},
			ru: {
				welcome: 'Добро пожаловать!',
				supplierName: 'TechPro Supply',
				revenue: 'Месячная выручка',
				currency: '₸',
				pendingRequests: 'Ожидающие запросы',
				openOrders: 'Открытые заказы',
				complaints: 'Активные жалобы',
				viewAll: 'Показать все',
				requests: 'запросов',
				orders: 'заказов',
				issues: 'проблем'
			}
		},
		profile: {
			en: {
				profile: 'Profile',
				organizationInfo: 'Organization Information',
				companyName: 'Company Name',
				address: 'Address',
				phone: 'Phone',
				email: 'Email',
				website: 'Website',
				language: 'Language',
				english: 'English',
				russian: 'Russian',
				logout: 'Logout',
				settings: 'Settings'
			},
			ru: {
				profile: 'Профиль',
				organizationInfo: 'Информация об организации',
				companyName: 'Название компании',
				address: 'Адрес',
				phone: 'Телефон',
				email: 'Email',
				website: 'Веб-сайт',
				language: 'Язык',
				english: 'English',
				russian: 'Русский',
				logout: 'Выйти',
				settings: 'Настройки'
			}
		},
		catalog: {
			en: {
				catalog: 'Catalog',
				search: 'Search products...',
				addItem: 'Add Item',
				noProducts: 'No products yet',
				noProductsDesc: 'Start building your catalog by adding your first product',
				inStock: 'In Stock',
				outOfStock: 'Out of Stock',
				currency: '₸',
				edit: 'Edit',
				delete: 'Delete'
			},
			ru: {
				catalog: 'Каталог',
				search: 'Поиск товаров...',
				addItem: 'Добавить товар',
				noProducts: 'Товаров пока нет',
				noProductsDesc: 'Начните создание каталога, добавив первый товар',
				inStock: 'В наличии',
				outOfStock: 'Нет в наличии',
				currency: '₸',
				edit: 'Редактировать',
				delete: 'Удалить'
			}
		},
		orders: {
			en: {
				orders: 'Orders',
				noOrders: 'No orders yet',
				noOrdersDesc: 'Customer orders will appear here',
				order: 'Order',
				customer: 'Customer',
				currency: '₸',
				items: 'items'
			},
			ru: {
				orders: 'Заказы',
				noOrders: 'Заказов пока нет',
				noOrdersDesc: 'Заказы клиентов будут отображаться здесь',
				order: 'Заказ',
				customer: 'Клиент',
				currency: '₸',
				items: 'товаров'
			}
		},
		orderDetail: {
			en: {
				orderDetail: 'Order Details',
				loading: 'Loading...',
				order: 'Order',
				supplier: 'Supplier',
				date: 'Date',
				status: 'Status',
				timeline: 'Timeline',
				orderCreated: 'Order Created',
				total: 'Total',
				qty: 'Qty',
				openChat: 'Open Chat'
			},
			ru: {
				orderDetail: 'Детали заказа',
				loading: 'Загрузка...',
				order: 'Заказ',
				supplier: 'Поставщик',
				date: 'Дата',
				status: 'Статус',
				timeline: 'Хронология',
				orderCreated: 'Заказ создан',
				total: 'Итого',
				qty: 'Кол-во',
				openChat: 'Открыть чат'
			}
		},
		addItem: {
			en: {
				addItem: 'Add Item',
				productImage: 'Product Image',
				upload: 'Upload Image',
				takePhoto: 'Take Photo',
				productName: 'Product Name',
				price: 'Price (₸)',
				sku: 'SKU',
				stock: 'Stock Quantity',
				description: 'Description',
				save: 'Save Product',
				cancel: 'Cancel'
			},
			ru: {
				addItem: 'Добавить товар',
				productImage: 'Изображение товара',
				upload: 'Загрузить фото',
				takePhoto: 'Сделать фото',
				productName: 'Название товара',
				price: 'Цена (₸)',
				sku: 'Артикул',
				stock: 'Количество на складе',
				description: 'Описание',
				save: 'Сохранить товар',
				cancel: 'Отмена'
			}
		},
		requests: {
			en: {
				linkRequests: 'Link Requests',
				noRequests: 'No pending requests',
				noRequestsDesc: 'New connection requests will appear here',
				approve: 'Approve',
				reject: 'Reject',
				approvedTitle: 'Request approved!',
				rejectedTitle: 'Request rejected!'
			},
			ru: {
				linkRequests: 'Запросы на связь',
				noRequests: 'Ожидающих запросов нет',
				noRequestsDesc: 'Новые запросы на соединение будут отображаться здесь',
				approve: 'Одобрить',
				reject: 'Отклонить',
				approvedTitle: 'Запрос одобрен!',
				rejectedTitle: 'Запрос отклонён!'
			}
		}
	},
	shared: {
		common: {
			en: {
				loading: 'Loading...',
				back: 'Back',
				save: 'Save',
				cancel: 'Cancel',
				submit: 'Submit',
				delete: 'Delete',
				edit: 'Edit',
				yes: 'Yes',
				no: 'No',
				confirm: 'Confirm',
				close: 'Close'
			},
			ru: {
				loading: 'Загрузка...',
				back: 'Назад',
				save: 'Сохранить',
				cancel: 'Отмена',
				submit: 'Отправить',
				delete: 'Удалить',
				edit: 'Редактировать',
				yes: 'Да',
				no: 'Нет',
				confirm: 'Подтвердить',
				close: 'Закрыть'
			}
		}
	}
} as const

/**
 * Helper function to get translations for a specific module/screen
 */
export function getTranslations<T extends keyof typeof translations>(
	module: T,
	screen: keyof (typeof translations)[T],
	language: Language = 'en'
): Translations[T][keyof Translations[T]][string] {
	const screenTranslations = translations[module][screen as keyof (typeof translations)[T]]
	return screenTranslations[language]
}

/**
 * Helper function to get a specific translation key
 */
export function t(module: keyof typeof translations, screen: string, key: string, language: Language = 'en'): string {
	const screenTranslations = (translations[module] as any)[screen]
	if (!screenTranslations) return key
	return screenTranslations[language]?.[key] || key
}
