import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useProduct } from '../../hooks/useProduct';
import { useCart } from '../../hooks/useCart';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  productId: number | string | null;
  onBack: () => void;
  language?: 'en' | 'ru';
}

export default function ConsumerProductDetailScreen({ productId, onBack, language = 'en' }: Props) {
  const { item, loading, error } = useProduct(productId ?? undefined);
  const { add } = useCart();

  const [qty, setQty] = useState<number>(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const insets = useSafeAreaInsets();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const increment = () => setQty((q) => Math.min((item?.stock ?? 9999), q + 1));
  const decrement = () => setQty((q) => Math.max(1, q - 1));

  const t = {
    en: { inStock: 'In Stock', outOfStock: 'Out of stock', specs: 'Specifications', quantity: 'Quantity', add: 'Add to Order', back: 'Back to catalog' },
    ru: { inStock: 'В наличии', outOfStock: 'Нет в наличии', specs: 'Характеристики', quantity: 'Количество', add: 'Добавить в заказ', back: 'Назад в каталог' }
  } as any;

  const formatPrice = (price?: number) => {
    if (price == null) return '';
    try { return new Intl.NumberFormat('kk-KZ').format(price); } catch { return String(price); }
  };

  if (!productId) return (
    <SafeAreaView style={styles.center}>
      <Text>No product selected</Text>
      <TouchableOpacity onPress={onBack} style={{ marginTop: 12 }}>
        <Text style={{ color: '#2563eb' }}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  if (loading) return (
    <SafeAreaView style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={{ padding: 16 }}>
      <Text style={{ color: '#ef4444' }}>Error loading product</Text>
      <TouchableOpacity onPress={onBack} style={{ marginTop: 12 }}>
        <Text style={{ color: '#2563eb' }}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {((item?.imageUrl) || ((item as any)?.image)) && (
          <TouchableOpacity onPress={() => { setPreviewUri((item?.imageUrl ?? (item as any)?.image) as string); setPreviewVisible(true); }} activeOpacity={0.9}>
            <Image source={{ uri: (item?.imageUrl ?? (item as any)?.image) as string }} style={styles.image} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{item?.name}</Text>
        <Text style={styles.supplier}>{item?.supplier}</Text>
        <View style={styles.rowBetweenLarge}>
          <Text style={styles.price}>{item?.currency ?? '₸'}{formatPrice(item?.price)}</Text>
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>{item?.stock && item.stock > 0 ? `In Stock (${item.stock})` : 'Out of stock'}</Text>
          </View>
        </View>

        <Text style={{ marginTop: 12 }}>{item?.description}</Text>

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Specifications</Text>
          <View style={styles.specRow}><Text style={styles.specKey}>SKU</Text><Text style={styles.specVal}>{(item as any)?.sku ?? '—'}</Text></View>
          <View style={styles.specRow}><Text style={styles.specKey}>Supplier</Text><Text style={styles.specVal}>{item?.supplier ?? '—'}</Text></View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={decrement} style={styles.qtyBtn} disabled={qty <= 1}>
              <Feather name="minus" size={20} color={qty <= 1 ? '#cbd5e1' : '#111827'} />
            </TouchableOpacity>
            <View style={styles.qtyDisplay}><Text style={{ fontSize: 16 }}>{qty}</Text></View>
            <TouchableOpacity onPress={increment} style={styles.qtyBtn} disabled={item?.stock != null && qty >= item.stock}>
              <Feather name="plus" size={20} color={item?.stock != null && qty >= item.stock ? '#cbd5e1' : '#111827'} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={async () => {
            if (!item) return;
            // prevent adding more than stock
            if (typeof item.stock === 'number' && qty > item.stock) {
              setToastMessage(`Cannot add more than ${item.stock} items`);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2500);
              return;
            }
            await add(item.id, qty);
            setToastMessage('Added to cart');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
          }}
          style={styles.addBtn}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Add to Order</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onBack} style={{ marginTop: 12 }}>
          <Text style={{ color: '#2563eb', textAlign: 'center' }}>Back to catalog</Text>
        </TouchableOpacity>
      </ScrollView>
      {showToast && (
        <View style={[styles.toast, { bottom: insets.bottom + 16 }]}> 
          <Text style={{ color: '#fff' }}>{toastMessage}</Text>
        </View>
      )}
      {/* Fullscreen image preview modal */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setPreviewVisible(false)} style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}>
            <Feather name="x" size={28} color="#fff" />
          </TouchableOpacity>
          {previewUri ? <Image source={{ uri: previewUri }} style={{ width: '92%', height: '72%', resizeMode: 'contain' }} /> : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 220, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  supplier: { color: '#6b7280', marginTop: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  rowBetweenLarge: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'flex-start' },
  price: { fontSize: 18, color: '#2563eb', fontWeight: '700' },
  addBtn: { marginTop: 20, backgroundColor: '#2563eb', padding: 12, borderRadius: 8 },
  stockBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  stockBadgeText: { color: '#059669', fontSize: 12, fontWeight: '600' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  specKey: { color: '#6b7280' },
  specVal: { fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  qtyDisplay: { minWidth: 56, alignItems: 'center', justifyContent: 'center' }
  ,
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 8,
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  }
});
