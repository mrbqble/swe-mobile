import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../../hooks/useCart';
import { product, orders } from '../../api';
import { emitter } from '../../helpers/events';
import { toastShow } from '../../helpers/toast';
import { styles } from '../../styles/consumer/ConsumerCartScreen.styles';
import { getTranslations, type Language } from '../../translations';
import { formatPrice } from '../../utils/formatters';
import { DELIVERY_METHOD, type DeliveryMethod } from '../../constants';

export default function ConsumerCartScreen({ onBack, navigateTo, language }: { onBack: () => void; navigateTo?: (screen: string) => void; language?: 'en' | 'ru' }) {
  const { items, totalQty, loading, load, add, remove, clear, update } = useCart();
  const t = getTranslations('consumer', 'cart', language || 'en');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DELIVERY_METHOD.PICKUP);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [detailed, setDetailed] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingDetails(true);
      try {
        // items are expected as { productId, qty }
        const proms = items.map((it: any) => (product as any).fetchProduct(it.productId));
        const prods = await Promise.all(proms);
        if (mounted) setDetailed(items.map((it: any, i: number) => ({ ...it, product: prods[i] })));
      } catch (err) {
        if (mounted) setDetailed([]);
      } finally { if (mounted) setLoadingDetails(false); }
    })();
    return () => { mounted = false; };
  }, [items]);

  // Optimistic update helper: update local detailed immediately then call API
  const handleChangeQty = (productId: number | string, newQty: number) => {
    setDetailed(prev => {
      if (newQty <= 0) return prev.filter(p => String(p.productId) !== String(productId));
      return prev.map(p => String(p.productId) === String(productId) ? { ...p, qty: newQty } : p);
    });
    // call API to persist
    update(productId, newQty).catch(() => {
      // on error, reload from server to correct state
      load();
    });
  };

  if (loading) return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Cart</Text>
        <Text style={{ color: '#6b7280' }}>{totalQty} items</Text>
      </View>

      {loadingDetails ? (
        <ActivityIndicator style={{ marginTop: 24 }} size="large" color="#2563eb" />
      ) : detailed.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Feather name="shopping-cart" size={64} color="#9ca3af" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: '#374151' }}>{t.emptyCart || 'Your cart is empty'}</Text>
          <Text style={{ marginTop: 8, color: '#6b7280', textAlign: 'center' }}>{t.emptyCartDesc || 'Add items from the catalog to get started'}</Text>
          {navigateTo && (
            <TouchableOpacity
              onPress={() => navigateTo('catalog')}
              style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#2563eb', borderRadius: 8 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{t.browseCatalog || 'Browse Catalog'}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={detailed}
          keyExtractor={(i: any) => String(i.productId)}
          renderItem={({ item }: any) => (
            <View style={styles.row}>
              {item.product?.imageUrl ? <Image source={{ uri: item.product.imageUrl }} style={styles.img} /> : <View style={styles.imgPlaceholder} />}
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={{ fontWeight: '600' }}>{item.product?.name ?? `${t.product} ${item.productId}`}</Text>
                <Text style={{ color: '#6b7280', marginTop: 4 }}>{item.product?.supplier || ''}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => handleChangeQty(item.productId, Math.max(0, item.qty - 1))} style={{ marginRight: 12 }}>
                    <Text style={{ color: '#ef4444' }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 8 }}>Qty: {item.qty}</Text>
                  <TouchableOpacity onPress={() => handleChangeQty(item.productId, item.qty + 1)} style={{ marginLeft: 12 }}>
                    <Text style={{ color: '#059669' }}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(item.productId)} style={{ marginLeft: 16 }}>
                    <Text style={{ color: '#ef4444' }}>{getTranslations('shared', 'common', language || 'en').delete}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#2563eb', fontWeight: '700' }}>{item.product ? formatPrice(item.product.price) : ''}</Text>
                <Text style={{ color: '#6b7280', marginTop: 6 }}>{item.product ? `Subtotal: ${formatPrice(Number(item.product.price || 0) * Number(item.qty || 0))}` : ''}</Text>
              </View>
            </View>
          )}
        />
      )}

      {detailed.length > 0 && (
        <>
      <View style={{ padding: 16 }}>
            <Text style={{ marginBottom: 8, color: '#374151', fontWeight: '600' }}>{t.delivery || 'Delivery Method'}</Text>
        <TouchableOpacity onPress={() => setDeliveryModalOpen(true)} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}>
          <Text>{deliveryMethod}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#6b7280' }}>{t.total || 'Total'}</Text>
          <Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(detailed.reduce((s, it) => s + (Number(it.product?.price || 0) * Number(it.qty || 0)), 0))}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={async () => {
                try {
                  await clear();
                  toastShow(t.clear || 'Cleared', 'Cart has been cleared');
                } catch (err: any) {
                  toastShow('Error', err?.message || 'Failed to clear cart');
                }
              }} style={[styles.clearBtn, { flex: 1, marginRight: 8 }]}>
                <Text style={{ color: '#fff' }}>{t.clear || 'Clear'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPlaceModalOpen(true)} style={[styles.checkoutBtn, { flex: 1, marginLeft: 8 }]} disabled={placing || detailed.length === 0}>
                <Text style={{ color: '#fff' }}>{placing ? (t.placing || 'Placing...') : (t.placeOrder || 'Place Order')}</Text>
              </TouchableOpacity>
        </View>
      </View>
        </>
      )}

      <Modal visible={deliveryModalOpen} transparent animationType="fade">
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ margin: 24, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: '700', marginBottom: 12 }}>Delivery Method</Text>
            <TouchableOpacity onPress={() => { setDeliveryMethod(DELIVERY_METHOD.PICKUP); setDeliveryModalOpen(false); }} style={{ paddingVertical: 12 }}>
              <Text>{DELIVERY_METHOD.PICKUP}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setDeliveryMethod(DELIVERY_METHOD.DELIVERY); setDeliveryModalOpen(false); }} style={{ paddingVertical: 12 }}>
              <Text>{DELIVERY_METHOD.DELIVERY}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeliveryModalOpen(false)} style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#6b7280' }}>{getTranslations('shared', 'common', language || 'en').cancel}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={placeModalOpen} transparent animationType="fade">
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ margin: 24, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: '700', marginBottom: 12 }}>{t.confirmOrder}</Text>
            <Text style={{ marginBottom: 12 }}>{t.confirmOrderMessage ? t.confirmOrderMessage.replace('{count}', String(detailed.reduce((s, it) => s + it.qty, 0))) : `Place order for ${detailed.reduce((s, it) => s + it.qty, 0)} items?`}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setPlaceModalOpen(false)} style={{ padding: 12, marginRight: 8 }}>
                <Text style={{ color: '#6b7280' }}>{getTranslations('shared', 'common', language || 'en').cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                if (placing) return;
                setPlacing(true);
                try {
                  // Validate that all items have product data
                  if (detailed.length === 0 || detailed.some(d => !d.product)) {
                    throw new Error('Cannot place order: some items are missing product information');
                  }

                  // Get supplier_id from first item (all items should be from same supplier)
                  const supplierId = detailed[0]?.product?.supplierId || detailed[0]?.product?.supplier_id;
                  if (!supplierId) {
                    throw new Error('Cannot place order: supplier information missing');
                  }

                  // Format items for order API: { productId, supplierId, qty }
                  const orderItems = detailed.map(d => ({
                    productId: d.productId || d.product?.id,
                    supplierId: supplierId,
                    qty: d.qty || 1
                  }));

                  const total = detailed.reduce((s, it) => s + (Number(it.product?.price || 0) * Number(it.qty || 0)), 0);

                  await orders.placeOrderFromCart(orderItems, total);
                  await clear();
                  setPlaceModalOpen(false);
                  toastShow(t.orderPlaced || 'Order Placed', t.orderPlacedMessage || 'Your order has been placed successfully.');
                  // Emit event to refresh orders list
                  emitter.emit('ordersChanged');
                  // navigate to orders if provided
                  if (navigateTo) navigateTo('consumer-orders');
                } catch (err: any) {
                  console.error('Failed to place order:', err);
                  const errorMsg = err?.body?.detail || err?.message || 'Failed to place order';
                  toastShow('Error', errorMsg);
                } finally {
                  setPlacing(false);
                }
              }} style={{ padding: 12, backgroundColor: '#2563eb', borderRadius: 8 }}>
                <Text style={{ color: '#fff' }}>{placing ? (t.placing || 'Placing...') : (getTranslations('shared', 'common', language || 'en').confirm || 'Confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
