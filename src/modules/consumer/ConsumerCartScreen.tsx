import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../../hooks/useCart';
import { product, orders } from '../../api';

export default function ConsumerCartScreen({ onBack, navigateTo, language }: { onBack: () => void; navigateTo?: (screen: string) => void; language?: 'en' | 'ru' }) {
  const { items, totalQty, loading, load, add, remove, clear, update } = useCart();
  const t = {
    en: { cart: 'Cart', total: 'Total', delivery: 'Delivery Method', clear: 'Clear', placeOrder: 'Place Order' },
    ru: { cart: 'Корзина', total: 'Итого', delivery: 'Способ доставки', clear: 'Очистить', placeOrder: 'Оформить заказ' }
  } as any;
  const [deliveryMethod, setDeliveryMethod] = useState<'Pickup' | 'Delivery'>('Pickup');
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
      ) : (
        <FlatList
          data={detailed}
          keyExtractor={(i: any) => String(i.productId)}
          renderItem={({ item }: any) => (
            <View style={styles.row}>
              {item.product?.imageUrl ? <Image source={{ uri: item.product.imageUrl }} style={styles.img} /> : <View style={styles.imgPlaceholder} />}
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={{ fontWeight: '600' }}>{item.product?.name ?? 'Product ' + item.productId}</Text>
                <Text style={{ color: '#6b7280', marginTop: 4 }}>{item.product?.supplier}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => handleChangeQty(item.productId, Math.max(0, item.qty - 1))} style={{ marginRight: 12 }}>
                    <Text style={{ color: '#ef4444' }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 8 }}>Qty: {item.qty}</Text>
                  <TouchableOpacity onPress={() => handleChangeQty(item.productId, item.qty + 1)} style={{ marginLeft: 12 }}>
                    <Text style={{ color: '#059669' }}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(item.productId)} style={{ marginLeft: 16 }}>
                    <Text style={{ color: '#ef4444' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#2563eb', fontWeight: '700' }}>{item.product ? `₸${new Intl.NumberFormat('kk-KZ').format(item.product.price)}` : ''}</Text>
                <Text style={{ color: '#6b7280', marginTop: 6 }}>{item.product ? `Subtotal: ₸${new Intl.NumberFormat('kk-KZ').format(Number(item.product.price || 0) * Number(item.qty || 0))}` : ''}</Text>
              </View>
            </View>
          )}
        />
      )}

      <View style={{ padding: 16 }}>
        <Text style={{ marginBottom: 8, color: '#374151', fontWeight: '600' }}>Delivery Method</Text>
        <TouchableOpacity onPress={() => setDeliveryModalOpen(true)} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}>
          <Text>{deliveryMethod}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: '#6b7280' }}>Total</Text>
          <Text style={{ color: '#2563eb', fontWeight: '700' }}>{`₸${new Intl.NumberFormat('kk-KZ').format(detailed.reduce((s, it) => s + (Number(it.product?.price || 0) * Number(it.qty || 0)), 0))}`}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => clear()} style={[styles.clearBtn, { flex: 1, marginRight: 8 }]}><Text style={{ color: '#fff' }}>Clear</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setPlaceModalOpen(true)} style={[styles.checkoutBtn, { flex: 1, marginLeft: 8 }]} disabled={detailed.length === 0}><Text style={{ color: '#fff' }}>{placing ? 'Placing...' : 'Place Order'}</Text></TouchableOpacity>
        </View>
      </View>

      <Modal visible={deliveryModalOpen} transparent animationType="fade">
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ margin: 24, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: '700', marginBottom: 12 }}>Delivery Method</Text>
            <TouchableOpacity onPress={() => { setDeliveryMethod('Pickup'); setDeliveryModalOpen(false); }} style={{ paddingVertical: 12 }}>
              <Text>Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setDeliveryMethod('Delivery'); setDeliveryModalOpen(false); }} style={{ paddingVertical: 12 }}>
              <Text>Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeliveryModalOpen(false)} style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#6b7280' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={placeModalOpen} transparent animationType="fade">
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ margin: 24, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: '700', marginBottom: 12 }}>Confirm Order</Text>
            <Text style={{ marginBottom: 12 }}>Place order for {detailed.reduce((s, it) => s + it.qty, 0)} items?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setPlaceModalOpen(false)} style={{ padding: 12, marginRight: 8 }}>
                <Text style={{ color: '#6b7280' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                if (placing) return;
                setPlacing(true);
                try {
                  const payload = detailed.map(d => ({ productId: d.productId, name: d.product?.name, price: Number(d.product?.price || 0), qty: d.qty }));
                  const total = detailed.reduce((s, it) => s + (Number(it.product?.price || 0) * Number(it.qty || 0)), 0);
                  await orders.placeOrderFromCart(payload, total);
                  await clear();
                  setPlaceModalOpen(false);
                  // navigate to orders if provided
                  if (navigateTo) navigateTo('consumer-orders');
                } catch (err) {
                  // ignore for mock
                } finally {
                  setPlacing(false);
                }
              }} style={{ padding: 12, backgroundColor: '#2563eb', borderRadius: 8 }}>
                <Text style={{ color: '#fff' }}>{placing ? 'Placing...' : 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', alignItems: 'center' },
  img: { width: 72, height: 72, borderRadius: 8 },
  imgPlaceholder: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#f3f4f6' },
  footer: { padding: 16, flexDirection: 'row', justifyContent: 'space-between' },
  clearBtn: { backgroundColor: '#ef4444', padding: 12, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' },
  checkoutBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: 'center' }
});
