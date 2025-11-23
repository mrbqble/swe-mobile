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
				passwordPlaceholder: 'Enter your password',
				pleaseWait: 'Please wait...',
				noAccount: "Don't have an account? Register",
				allFieldsRequired: 'All fields are required',
				signInFailed: 'Sign in failed'
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
				passwordPlaceholder: 'Введите пароль',
				pleaseWait: 'Пожалуйста, подождите...',
				noAccount: 'Нет аккаунта? Зарегистрироваться',
				allFieldsRequired: 'Все поля обязательны',
				signInFailed: 'Ошибка входа'
			}
		},
		register: {
			en: {
				title: 'Register',
				name: 'Full name',
				firstName: 'First name',
				lastName: 'Last name',
				firstNamePlaceholder: 'First name',
				lastNamePlaceholder: 'Last name',
				email: 'Email',
				password: 'Password',
				register: 'Create account',
				haveAccount: 'Already have an account? Sign in',
				allFieldsRequired: 'All fields are required',
				invalidEmail: 'Please enter a valid email address',
				passwordRequirements: 'Password must be 8+ chars with upper, lower and a number or symbol',
				passwordMinLength: 'At least 8 characters',
				passwordUpper: 'One uppercase letter',
				passwordLower: 'One lowercase letter',
				passwordDigitOrSymbol: 'One number or symbol',
				accountCreated: 'Account created',
				registrationFailed: 'Registration failed'
			},
			ru: {
				title: 'Регистрация',
				name: 'Полное имя',
				firstName: 'Имя',
				lastName: 'Фамилия',
				firstNamePlaceholder: 'Имя',
				lastNamePlaceholder: 'Фамилия',
				email: 'Email',
				password: 'Пароль',
				register: 'Зарегистрироваться',
				haveAccount: 'Если у Вас есть аккаунт? Войдите вход',
				allFieldsRequired: 'Все поля обязательны',
				invalidEmail: 'Пожалуйста, введите действительный адрес электронной почты',
				passwordRequirements: 'Пароль должен содержать 8+ символов с заглавной, строчной буквой и цифрой или символом',
				passwordMinLength: 'Не менее 8 символов',
				passwordUpper: 'Одна заглавная буква',
				passwordLower: 'Одна строчная буква',
				passwordDigitOrSymbol: 'Одна цифра или символ',
				accountCreated: 'Аккаунт создан',
				registrationFailed: 'Ошибка регистрации'
			}
		},
		languagePicker: {
			en: {
				chooseLanguage: 'Choose Language',
				selectLanguage: 'Select your preferred language to continue',
				english: 'English'
			},
			ru: {
				chooseLanguage: 'Выберите язык',
				selectLanguage: 'Выберите предпочитаемый язык для продолжения',
				english: 'English'
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
				placeOrder: 'Place Order',
				emptyCart: 'Your cart is empty',
				emptyCartDesc: 'Add items from the catalog to get started',
				browseCatalog: 'Browse Catalog',
				orderPlaced: 'Order Placed',
				orderPlacedMessage: 'Your order has been placed successfully.',
				placing: 'Placing...'
			},
			ru: {
				cart: 'Корзина',
				total: 'Итого',
				delivery: 'Способ доставки',
				clear: 'Очистить',
				placeOrder: 'Оформить заказ',
				emptyCart: 'Ваша корзина пуста',
				emptyCartDesc: 'Добавьте товары из каталога, чтобы начать',
				browseCatalog: 'Просмотреть каталог',
				orderPlaced: 'Заказ размещен',
				orderPlacedMessage: 'Ваш заказ успешно размещен.',
				placing: 'Размещение...'
			}
		},
		catalog: {
			en: {
				catalog: 'Catalog',
				search: 'Search products...',
				inStock: 'In Stock',
				outOfStock: 'Out of Stock',
				currency: '₸',
				supplier: 'Supplier:',
				noAcceptedLinks: "You don't have any accepted supplier links yet. Request a link from suppliers to view their catalog.",
				requestLink: 'Request Link',
				errorLoadingProducts: 'Error loading products',
				retry: 'Retry',
				noProductsFound: 'No products found',
				tryDifferentSearch: 'Try a different search term',
				noProductsAvailable: 'No products available'
			},
			ru: {
				catalog: 'Каталог',
				search: 'Поиск товаров...',
				inStock: 'В наличии',
				outOfStock: 'Нет в наличии',
				currency: '₸',
				supplier: 'Поставщик:',
				noAcceptedLinks: 'У вас пока нет принятых связей с поставщиками. Запросите связь у поставщиков, чтобы просмотреть их каталог.',
				requestLink: 'Запросить связь',
				errorLoadingProducts: 'Ошибка загрузки товаров',
				retry: 'Повторить',
				noProductsFound: 'Товары не найдены',
				tryDifferentSearch: 'Попробуйте другой поисковый запрос',
				noProductsAvailable: 'Товары недоступны'
			}
		},
		orders: {
			en: {
				orders: 'Orders',
				loading: 'Loading...',
				orderPrefix: 'Order #',
				items: 'items',
				errorLoadingOrders: 'Error loading orders',
				retry: 'Retry',
				noOrdersYet: 'No Orders Yet',
				noOrdersYetDesc: 'Your orders will appear here once you place them',
				supplier: 'Supplier',
				statusPending: 'Pending',
				statusAccepted: 'Accepted',
				statusInProgress: 'In Progress',
				statusCompleted: 'Completed',
				statusRejected: 'Rejected'
			},
			ru: {
				orders: 'Заказы',
				loading: 'Загрузка...',
				orderPrefix: 'Заказ №',
				items: 'товаров',
				errorLoadingOrders: 'Ошибка загрузки заказов',
				retry: 'Повторить',
				noOrdersYet: 'Заказов пока нет',
				noOrdersYetDesc: 'Ваши заказы появятся здесь после их размещения',
				supplier: 'Поставщик',
				statusPending: 'Ожидает',
				statusAccepted: 'Принят',
				statusInProgress: 'В процессе',
				statusCompleted: 'Завершен',
				statusRejected: 'Отклонен'
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
				orderAccepted: 'Order Accepted',
				inProgress: 'In Progress',
				completed: 'Completed',
				total: 'Total',
				qty: 'Qty',
				noDescription: 'No description provided',
				pending: 'Pending',
				openChat: 'Open Chat',
				complaintSubmitted: 'Complaint Submitted',
				reportIssue: 'Report an issue',
				complaintStatus: 'Complaint Status',
				submitted: 'Submitted:',
				thanksForFeedback: 'Thanks for your feedback!',
				notifiedSupplier: 'We notified the supplier and reopened the complaint',
				couldNotReopen: 'Could not reopen complaint',
				cannotCreateComplaint: 'Cannot create complaint: supplier information missing',
				complaintLogged: 'Complaint logged',
				complaintLoggedMessage: 'We have recorded your issue and supplier will be notified',
				couldNotSubmitComplaint: 'Could not submit complaint',
				didResolutionHelp: 'Did this resolution help you?',
				yes: 'Yes',
				no: 'No',
				thankYouForResponse: 'Thank you for your response.',
				statusOpen: 'Open',
				statusEscalated: 'Escalated',
				statusResolved: 'Resolved',
				reopenComplaint: 'Reopen Complaint'
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
				orderAccepted: 'Заказ принят',
				inProgress: 'В процессе',
				completed: 'Завершен',
				total: 'Итого',
				qty: 'Кол-во',
				noDescription: 'Описание не предоставлено',
				pending: 'Ожидает',
				openChat: 'Открыть чат',
				complaintSubmitted: 'Жалоба отправлена',
				reportIssue: 'Сообщить о проблеме',
				complaintStatus: 'Статус жалобы',
				submitted: 'Отправлено:',
				thanksForFeedback: 'Спасибо за ваш отзыв!',
				notifiedSupplier: 'Мы уведомили поставщика и переоткрыли жалобу',
				couldNotReopen: 'Не удалось переоткрыть жалобу',
				cannotCreateComplaint: 'Невозможно создать жалобу: отсутствует информация о поставщике',
				complaintLogged: 'Жалоба зарегистрирована',
				complaintLoggedMessage: 'Мы зафиксировали вашу проблему, и поставщик будет уведомлен',
				couldNotSubmitComplaint: 'Не удалось отправить жалобу',
				didResolutionHelp: 'Помогло ли это решение?',
				yes: 'Да',
				no: 'Нет',
				thankYouForResponse: 'Спасибо за ваш ответ.',
				statusOpen: 'Открыта',
				statusEscalated: 'Эскалирована',
				statusResolved: 'Решена',
				reopenComplaint: 'Переоткрыть жалобу'
			}
		},
		productDetail: {
			en: {
				inStock: 'In Stock',
				outOfStock: 'Out of stock',
				specs: 'Specifications',
				quantity: 'Quantity',
				add: 'Add to Order',
				back: 'Back to catalog',
				supplier: 'Supplier',
				noProductSelected: 'No product selected',
				errorLoadingProduct: 'Error loading product:',
				product: 'Product',
				sku: 'SKU',
				cannotAddMore: 'Cannot add more than {count} items',
				addedToCart: 'Added to cart'
			},
			ru: {
				inStock: 'В наличии',
				outOfStock: 'Нет в наличии',
				specs: 'Характеристики',
				quantity: 'Количество',
				add: 'Добавить в заказ',
				back: 'Назад в каталог',
				supplier: 'Поставщик',
				noProductSelected: 'Товар не выбран',
				errorLoadingProduct: 'Ошибка загрузки товара:',
				product: 'Товар',
				sku: 'Артикул',
				cannotAddMore: 'Нельзя добавить более {count} товаров',
				addedToCart: 'Добавлено в корзину'
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
				loading: 'Loading...',
				noSuppliersFound: 'No suppliers found',
				supplier: 'Supplier',
				requestSubmittedMessage: 'The supplier will review your request.',
				submitFailed: 'Could not submit link request',
				allSuppliersLinked: 'All suppliers are already linked',
				allSuppliersLinkedDesc: 'You have already linked with all available suppliers or have pending requests with them.',
				tryDifferentSearch: 'Try a different search term'
			},
			ru: {
				requestLink: 'Запрос связи',
				searchSuppliers: 'Поиск поставщиков',
				placeholder: 'Введите название поставщика или компании',
				submitRequest: 'Отправить запрос',
				loading: 'Загрузка...',
				noSuppliersFound: 'Поставщики не найдены',
				supplier: 'Поставщик',
				requestSubmittedMessage: 'Поставщик рассмотрит ваш запрос.',
				submitFailed: 'Не удалось отправить запрос на связь',
				allSuppliersLinked: 'Все поставщики уже связаны',
				allSuppliersLinkedDesc: 'Вы уже связаны со всеми доступными поставщиками или у вас есть ожидающие запросы с ними.',
				tryDifferentSearch: 'Попробуйте другой поисковый запрос'
			}
		},
		suppliers: {
			en: {
				linkedSuppliers: 'Linked Suppliers',
				loading: 'Loading...',
				products: 'products',
				unknownSupplier: 'Unknown Supplier',
				supplier: 'Supplier',
				requested: 'Requested',
				noLinkedSuppliers: 'No Linked Suppliers',
				noLinkedSuppliersDesc: 'Request a link with a supplier to start ordering',
				statusPending: 'Pending',
				statusAccepted: 'Accepted',
				statusDenied: 'Denied',
				statusBlocked: 'Blocked',
				statusRejected: 'Rejected'
			},
			ru: {
				linkedSuppliers: 'Связанные поставщики',
				loading: 'Загрузка...',
				products: 'товаров',
				unknownSupplier: 'Неизвестный поставщик',
				supplier: 'Поставщик',
				requested: 'Запрошено',
				noLinkedSuppliers: 'Нет связанных поставщиков',
				noLinkedSuppliersDesc: 'Запросите связь с поставщиком, чтобы начать заказывать',
				statusPending: 'Ожидает',
				statusAccepted: 'Принято',
				statusDenied: 'Отклонено',
				statusBlocked: 'Заблокировано',
				statusRejected: 'Отклонено'
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
				issues: 'issues',
				home: 'Home',
				catalog: 'Catalog',
				profile: 'Profile',
				underDevelopment: 'Under the development (not available)'
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
				issues: 'проблем',
				home: 'Главная',
				catalog: 'Каталог',
				profile: 'Профиль',
				underDevelopment: 'В разработке (недоступно)'
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
				settings: 'Settings',
				supplier: 'Supplier',
				name: 'Name'
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
				settings: 'Настройки',
				supplier: 'Поставщик',
				name: 'Имя'
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
				editStock: 'Edit stock',
				delete: 'Delete',
				deleteProduct: 'Delete product',
				deleteProductConfirm: 'Are you sure you want to delete this product?',
				sku: 'SKU:',
				productDeleted: 'Product removed from catalog',
				couldNotDelete: 'Could not delete product',
				stockUpdated: 'Stock updated',
				couldNotUpdateStock: 'Could not update stock',
				productSaved: 'Product saved',
				productAddedToCatalog: 'The product has been added to your catalog.'
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
				editStock: 'Редактировать запас',
				delete: 'Удалить',
				deleteProduct: 'Удалить товар',
				deleteProductConfirm: 'Вы уверены, что хотите удалить этот товар?',
				sku: 'Артикул:',
				productDeleted: 'Товар удален из каталога',
				couldNotDelete: 'Не удалось удалить товар',
				stockUpdated: 'Запас обновлен',
				couldNotUpdateStock: 'Не удалось обновить запас',
				productSaved: 'Товар сохранен',
				productAddedToCatalog: 'Товар был добавлен в ваш каталог.'
			}
		},
		orders: {
			en: {
				orders: 'Orders',
				noOrders: 'No orders yet',
				noOrdersDesc: 'Customer orders will appear here',
				order: 'Order',
				customer: 'Customer',
				consumer: 'Consumer',
				currency: '₸',
				items: 'items',
				id: 'ID:',
				statusPending: 'Pending',
				statusAccepted: 'Accepted',
				statusInProgress: 'In Progress',
				statusCompleted: 'Completed',
				statusRejected: 'Rejected'
			},
			ru: {
				orders: 'Заказы',
				noOrders: 'Заказов пока нет',
				noOrdersDesc: 'Заказы клиентов будут отображаться здесь',
				order: 'Заказ',
				customer: 'Клиент',
				consumer: 'Потребитель',
				currency: '₸',
				items: 'товаров',
				id: 'ID:',
				statusPending: 'Ожидает',
				statusAccepted: 'Принят',
				statusInProgress: 'В процессе',
				statusCompleted: 'Завершен',
				statusRejected: 'Отклонен'
			}
		},
		orderDetail: {
			en: {
				orderDetail: 'Order Details',
				loading: 'Loading...',
				order: 'Order',
				customer: 'Customer',
				supplier: 'Supplier',
				date: 'Date',
				status: 'Status',
				timeline: 'Timeline',
				orderCreated: 'Order Created',
				orderAccepted: 'Order Accepted',
				inProgress: 'In Progress',
				completed: 'Completed',
				total: 'Total',
				qty: 'Qty',
				openChat: 'Open Chat',
				updateStatus: 'Update Status',
				markAs: 'Mark as',
				rejectOrder: 'Reject Order',
				pending: 'Pending',
				orderStatusUpdated: 'Order status updated to {status}',
				failedToUpdateStatus: 'Failed to update order status',
				failedToLoadOrder: 'Failed to load order',
				consumer: 'Consumer'
			},
			ru: {
				orderDetail: 'Детали заказа',
				loading: 'Загрузка...',
				order: 'Заказ',
				customer: 'Клиент',
				supplier: 'Поставщик',
				date: 'Дата',
				status: 'Статус',
				timeline: 'Хронология',
				orderCreated: 'Заказ создан',
				orderAccepted: 'Заказ принят',
				inProgress: 'В процессе',
				completed: 'Завершен',
				total: 'Итого',
				qty: 'Кол-во',
				openChat: 'Открыть чат',
				updateStatus: 'Обновить статус',
				markAs: 'Отметить как',
				rejectOrder: 'Отклонить заказ',
				pending: 'Ожидание',
				orderStatusUpdated: 'Статус заказа обновлен на {status}',
				failedToUpdateStatus: 'Не удалось обновить статус заказа',
				failedToLoadOrder: 'Не удалось загрузить заказ',
				consumer: 'Потребитель'
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
				rejectedTitle: 'Request rejected!',
				statusUpdatedMessage: 'The consumer will see the updated status.',
				approveFailed: 'Failed to approve link request',
				rejectFailed: 'Failed to reject link request'
			},
			ru: {
				linkRequests: 'Запросы на связь',
				noRequests: 'Ожидающих запросов нет',
				noRequestsDesc: 'Новые запросы на соединение будут отображаться здесь',
				approve: 'Одобрить',
				reject: 'Отклонить',
				approvedTitle: 'Запрос одобрен!',
				rejectedTitle: 'Запрос отклонён!',
				statusUpdatedMessage: 'Потребитель увидит обновленный статус.',
				approveFailed: 'Не удалось одобрить запрос на связь',
				rejectFailed: 'Не удалось отклонить запрос на связь'
			}
		},
		complaintDetail: {
			en: {
				complaintDetails: 'Complaint Details',
				customer: 'Customer',
				status: 'Status',
				description: 'Description',
				noDescription: 'No description provided',
				unknown: 'Unknown',
				resolved: 'Resolved',
				resolving: 'Resolving...',
				resolveComplaint: 'Resolved the Complaint',
				escalated: 'Escalated',
				escalating: 'Escalating...',
				escalateToManager: 'Escalate to Manager',
				openChat: 'Open Chat',
				statusOpen: 'Open',
				statusEscalated: 'Escalated',
				statusResolved: 'Resolved'
			},
			ru: {
				complaintDetails: 'Детали жалобы',
				customer: 'Клиент',
				status: 'Статус',
				description: 'Описание',
				noDescription: 'Описание не предоставлено',
				unknown: 'Неизвестно',
				resolved: 'Решено',
				resolving: 'Решение...',
				resolveComplaint: 'Решить жалобу',
				escalated: 'Эскалировано',
				escalating: 'Эскалация...',
				escalateToManager: 'Эскалировать менеджеру',
				openChat: 'Открыть чат',
				statusOpen: 'Открыта',
				statusEscalated: 'Эскалирована',
				statusResolved: 'Решена'
			}
		},
		complaints: {
			en: {
				complaints: 'Complaints',
				noDescription: 'No description provided',
				noComplaints: 'No complaints yet',
				statusOpen: 'Open',
				statusEscalated: 'Escalated',
				statusResolved: 'Resolved'
			},
			ru: {
				complaints: 'Жалобы',
				noDescription: 'Описание не предоставлено',
				noComplaints: 'Жалоб пока нет',
				statusOpen: 'Открыта',
				statusEscalated: 'Эскалирована',
				statusResolved: 'Решена'
			}
		}
	},
	shared: {
		common: {
			en: {
				loading: 'Loading...',
				back: 'Back',
				save: 'Save',
				saving: 'Saving...',
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
				saving: 'Сохранение...',
				cancel: 'Отмена',
				submit: 'Отправить',
				delete: 'Удалить',
				edit: 'Редактировать',
				yes: 'Да',
				no: 'Нет',
				confirm: 'Подтвердить',
				close: 'Закрыть'
			}
		},
		chat: {
			en: {
				chat: 'Chat',
				loadingChat: 'Loading chat...',
				noSessionSupplier: 'No chat session found for this order. Consumer needs to start the chat first.',
				noSessionConsumer: 'Unable to start chat. Please try again later.',
				noMessages: 'No messages yet. Start the conversation!',
				typeMessage: 'Type a message...',
				attachUrl: 'Attach URL',
				attachmentUrlPlaceholder: 'Attachment URL (http://...)',
				optionalName: 'Optional name',
				pickImage: 'Pick Image',
				attach: 'Attach',
				you: 'You',
				supplier: 'Supplier',
				consumer: 'Consumer',
				read: 'Read',
				delivered: 'Delivered',
				orderPrefix: 'Order #',
				justNow: 'just now',
				ago: 'ago'
			},
			ru: {
				chat: 'Чат',
				loadingChat: 'Загрузка чата...',
				noSessionSupplier: 'Чат-сессия для этого заказа не найдена. Потребитель должен начать чат первым.',
				noSessionConsumer: 'Не удалось начать чат. Пожалуйста, попробуйте позже.',
				noMessages: 'Пока нет сообщений. Начните разговор!',
				typeMessage: 'Введите сообщение...',
				attachUrl: 'Прикрепить URL',
				attachmentUrlPlaceholder: 'URL вложения (http://...)',
				optionalName: 'Необязательное имя',
				pickImage: 'Выбрать изображение',
				attach: 'Прикрепить',
				you: 'Вы',
				supplier: 'Поставщик',
				consumer: 'Потребитель',
				read: 'Прочитано',
				delivered: 'Доставлено',
				orderPrefix: 'Заказ #',
				justNow: 'только что',
				ago: 'назад'
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
	const screenTranslations = translations[module]?.[screen as keyof (typeof translations)[T]]
	if (!screenTranslations) {
		console.warn(`Translations not found for ${String(module)}.${String(screen)}`)
		return {} as any
	}
	const langTranslations = screenTranslations[language]
	if (!langTranslations) {
		console.warn(`Language ${language} not found for ${String(module)}.${String(screen)}, falling back to 'en'`)
		return screenTranslations['en'] || ({} as any)
	}
	return langTranslations
}

/**
 * Helper function to get a specific translation key
 */
export function t(module: keyof typeof translations, screen: string, key: string, language: Language = 'en'): string {
	const screenTranslations = (translations[module] as any)[screen]
	if (!screenTranslations) return key
	return screenTranslations[language]?.[key] || key
}
