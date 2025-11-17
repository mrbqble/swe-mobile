import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import SignInScreen from './src/auth/SignInScreen';
import RegisterScreen from './src/auth/RegisterScreen';
import LanguagePickerScreen from './src/auth/LanguagePickerScreen';
import ConsumerHomeScreen from './src/modules/consumer/ConsumerHomeScreen';
import SupplierHomeScreen from './src/modules/supplier/SupplierHomeScreen';
import SupplierRequestsScreen from './src/modules/supplier/SupplierRequestsScreen';
import SupplierCatalogScreen from './src/modules/supplier/SupplierCatalogScreen';
import SupplierAddItemScreen from './src/modules/supplier/SupplierAddItemScreen';
import SupplierOrdersScreen from './src/modules/supplier/SupplierOrdersScreen';
import SupplierProfileScreen from './src/modules/supplier/SupplierProfileScreen';
import SupplierOrderDetailScreen from './src/modules/supplier/SupplierOrderDetailScreen';
import SupplierComplaintsScreen from './src/modules/supplier/SupplierComplaintsScreen';
import SupplierComplaintDetailScreen from './src/modules/supplier/SupplierComplaintDetailScreen';
import ChatScreen from './src/modules/shared/ChatScreen';
import ConsumerCatalogScreen from './src/modules/consumer/ConsumerCatalogScreen';
import ConsumerProductDetailScreen from './src/modules/consumer/ConsumerProductDetailScreen';
import ConsumerCartScreen from './src/modules/consumer/ConsumerCartScreen';
import ConsumerOrdersScreen from './src/modules/consumer/ConsumerOrdersScreen';
import ConsumerSuppliersScreen from './src/modules/consumer/ConsumerSuppliersScreen';
import ConsumerOrderDetailScreen from './src/modules/consumer/ConsumerOrderDetailScreen';
import ConsumerRequestLinkScreen from './src/modules/consumer/ConsumerRequestLinkScreen';
import ConsumerProfileScreen from './src/modules/consumer/ConsumerProfileScreen';
import { linkedSuppliers } from './src/api';
import ToastHost from './src/modules/shared/ToastHost';


type Language = 'en' | 'ru';
type UserRole = 'consumer' | 'supplier' | null;

export default function App() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [showRegister, setShowRegister] = useState(false);
  const user = { name: 'John Smith', org: 'Smith Trading LLC', email: 'john.smith@example.com' };
  // Simple screen navigation for the consumer UI
  const [consumerScreen, setConsumerScreen] = useState<string>('consumer-home');
  const [selectedProductId, setSelectedProductId] = useState<number | string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  // supplier navigation state (keep hooks at top-level to preserve hook order)
  const [supplierScreen, setSupplierScreen] = useState<string>('supplier-home');
  const [supplierSelectedOrderId, setSupplierSelectedOrderId] = useState<string | null>(null);
  const [supplierSelectedComplaintId, setSupplierSelectedComplaintId] = useState<string | null>(null);
  const [supplierChatReturnTo, setSupplierChatReturnTo] = useState<string>('supplier-order-detail');

  if (language === null) {
    return (
      <SafeAreaProvider >
        <View style={{ flex: 1 }}>
          <LanguagePickerScreen onLanguageSelect={setLanguage} />
          <ToastHost />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!signedIn) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          {!showRegister && (
            <SignInScreen
              language={language}
              onSignIn={(selectedRole: UserRole) => {
                setRole(selectedRole);
                setSignedIn(true);
                // reset navigation state for the selected role so we always land on the home screen
                if (selectedRole === 'supplier') {
                  setSupplierScreen('supplier-home');
                } else if (selectedRole === 'consumer') {
                  setConsumerScreen('consumer-home');
                }
              }}
              onRegister={() => setShowRegister(true)}
            />
          )}
          {showRegister && (
            <RegisterScreen
              language={language as 'en' | 'ru'}
              onRegistered={(user) => {
                // After successful registration, sign in as consumer and navigate to consumer home
                setRole('consumer');
                setSignedIn(true);
                setConsumerScreen('consumer-home');
                setShowRegister(false);
              }}
              onCancel={() => setShowRegister(false)}
            />
          )}
          <ToastHost />
        </View>
      </SafeAreaProvider>
    );
  }

  if (role === 'supplier') {
    const navigateSupplierTo = (screen: string) => setSupplierScreen(screen);
    const supplierName = 'TechPro Supply';

    return (
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          {supplierScreen === 'supplier-home' && (
            <SupplierHomeScreen language={language as 'en' | 'ru'} userName={supplierName} navigateTo={navigateSupplierTo} />
          )}
          {supplierScreen === 'item-edit' && (
            <SupplierAddItemScreen language={language as 'en' | 'ru'} navigateTo={navigateSupplierTo} supplierName={supplierName} />
          )}
          {supplierScreen === 'link-requests' && (
            <SupplierRequestsScreen language={language as 'en' | 'ru'} navigateTo={navigateSupplierTo} supplierName={supplierName} />
          )}
          {supplierScreen === 'supplier-catalog' && (
            <SupplierCatalogScreen language={language as 'en' | 'ru'} navigateTo={navigateSupplierTo} supplierName={supplierName} />
          )}
          {supplierScreen === 'supplier-orders' && (
            <SupplierOrdersScreen language={language as 'en' | 'ru'} navigateTo={navigateSupplierTo} onOrderSelect={(o: any) => { setSupplierSelectedOrderId(o?.id || null); setSupplierScreen('supplier-order-detail'); }} supplierName={supplierName} />
          )}
          {supplierScreen === 'complaints' && (
            <SupplierComplaintsScreen supplierName={supplierName} onBack={() => setSupplierScreen('supplier-home')} onOpenComplaint={(id: string) => { setSupplierSelectedComplaintId(id); setSupplierScreen('complaint-detail'); }} />
          )}
          {supplierScreen === 'complaint-detail' && (
            <SupplierComplaintDetailScreen
              complaintId={supplierSelectedComplaintId}
              onBack={() => setSupplierScreen('complaints')}
              onOpenChat={(orderId) => {
                setSupplierSelectedOrderId(orderId || null);
                setSupplierChatReturnTo('complaint-detail');
                setSupplierScreen('chat');
              }}
            />
          )}
          {supplierScreen === 'supplier-order-detail' && (
            <SupplierOrderDetailScreen
              orderId={supplierSelectedOrderId}
              onBack={() => setSupplierScreen('supplier-orders')}
              onOpenChat={() => {
                setSupplierChatReturnTo('supplier-order-detail');
                setSupplierScreen('chat');
              }}
              language={language as 'en' | 'ru'}
            />
          )}
          {supplierScreen === 'chat' && (
            <ChatScreen orderId={supplierSelectedOrderId} onBack={() => setSupplierScreen(supplierChatReturnTo)} role="supplier" />
          )}
          {supplierScreen === 'supplier-profile' && (
            <SupplierProfileScreen language={language as 'en' | 'ru'} onLanguageChange={(l) => setLanguage(l)} onLogout={() => { setSignedIn(false); setRole(null); setConsumerScreen('consumer-home'); }} navigateTo={navigateSupplierTo} supplierName={supplierName} />
          )}
          <ToastHost />
        </View>
      </SafeAreaProvider>
    );
  }

  // Default to consumer home
  const navigateTo = (screen: string) => {
    // Basic mapping: consumer-home, catalog, consumer-orders, linked-suppliers, consumer-profile
    if (screen === 'catalog' || screen === 'consumer-catalog') {
      setConsumerScreen('catalog');
      return;
    }
    if (screen === 'consumer-home') {
      setConsumerScreen('consumer-home');
      return;
    }
    // handle other simple ids by setting screen directly
    setConsumerScreen(screen);
  };

  const onProductSelect = (product: any) => {
    setSelectedProductId(product?.id ?? null);
    setConsumerScreen('product-detail');
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {consumerScreen === 'consumer-home' && (
          <ConsumerHomeScreen language={language} navigateTo={navigateTo} />
        )}
        {consumerScreen === 'catalog' && (
          <ConsumerCatalogScreen language={language as 'en' | 'ru'} navigateTo={navigateTo} onProductSelect={onProductSelect} />
        )}
        {consumerScreen === 'product-detail' && (
          <ConsumerProductDetailScreen
            productId={selectedProductId}
            onBack={() => setConsumerScreen('catalog')}
            language={language as 'en' | 'ru'}
          />
        )}
        {consumerScreen === 'consumer-orders' && (
          <ConsumerOrdersScreen onBack={() => setConsumerScreen('consumer-home')} onOpenOrder={(id) => { setSelectedOrderId(id); setConsumerScreen('order-detail'); }} language={language as 'en' | 'ru'} />
        )}
        {consumerScreen === 'linked-suppliers' && (
          <ConsumerSuppliersScreen onBack={() => setConsumerScreen('consumer-home')} onRequestLink={() => setConsumerScreen('request-link')} language={language as 'en' | 'ru'} />
        )}
        {consumerScreen === 'request-link' && (
          <ConsumerRequestLinkScreen onBack={() => setConsumerScreen('linked-suppliers')} onSubmit={async (supplierId) => {
            try {
              // call API adapter to create a link request; mock adapter will update in-memory list
              await (linkedSuppliers as any).addLinkRequest(supplierId);
            } catch (err) {
              // ignore for mock; in real adapter you'd handle errors
            }
            // after submit, navigate back to linked suppliers which will re-fetch the list
            setConsumerScreen('linked-suppliers');
          }} language={language as 'en' | 'ru'} />
        )}
        {consumerScreen === 'order-detail' && (
          <ConsumerOrderDetailScreen orderId={selectedOrderId} onBack={() => setConsumerScreen('consumer-orders')} onOpenChat={() => setConsumerScreen('chat')} language={language as 'en' | 'ru'} userName={user.name} />
        )}
        {consumerScreen === 'cart' && (
          <ConsumerCartScreen onBack={() => setConsumerScreen('catalog')} navigateTo={navigateTo} language={language as 'en' | 'ru'} />
        )}
        {consumerScreen === 'chat' && (
          <ChatScreen orderId={selectedOrderId} onBack={() => setConsumerScreen('order-detail')} role="consumer" />
        )}
        {consumerScreen === 'consumer-profile' && (
          <ConsumerProfileScreen user={user} language={language as 'en' | 'ru'} setLanguage={(l) => setLanguage(l)} onLogout={() => { setSignedIn(false); setRole(null); setConsumerScreen('consumer-home'); }} onBack={() => setConsumerScreen('consumer-home')} />
        )}
        <ToastHost />
      </View>
    </SafeAreaProvider>
  );
}

