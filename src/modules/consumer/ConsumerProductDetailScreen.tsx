import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { styles } from '../../styles/consumer/ConsumerProductDetailScreen.styles';
import { Feather } from '@expo/vector-icons';
import { useProduct } from '../../hooks/useProduct';
import { useCart } from '../../hooks/useCart';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTranslations, type Language } from '../../translations';
import { formatPrice } from '../../utils/formatters';
import { TIMING } from '../../constants';

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

  const t = getTranslations('consumer', 'productDetail', language || 'en');


  if (!productId) return (
    <SafeAreaView style={styles.center}>
      <Text>{t.noProductSelected || 'No product selected'}</Text>
      <TouchableOpacity onPress={onBack} style={{ marginTop: 12 }}>
        <Text style={{ color: '#2563eb' }}>{getTranslations('shared', 'common', language || 'en').back || 'Back'}</Text>
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
      <Text style={{ color: '#ef4444' }}>{t.errorLoadingProduct || 'Error loading product:'} {error instanceof Error ? error.message : String(error)}</Text>
      <TouchableOpacity onPress={onBack} style={{ marginTop: 12 }}>
        <Text style={{ color: '#2563eb' }}>{getTranslations('shared', 'common', language || 'en').back}</Text>
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
        <Text style={styles.title}>{item?.name || t.product || 'Product'}</Text>
        <Text style={styles.supplier}>{item?.supplier || t.supplier || 'Supplier'}</Text>
        <View style={styles.rowBetweenLarge}>
          <Text style={styles.price}>{formatPrice(item?.price || 0, item?.currency ?? '₸')}</Text>
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>{item?.stock && item.stock > 0 ? `${t.inStock} (${item.stock})` : t.outOfStock}</Text>
          </View>
        </View>

        {item?.description && <Text style={{ marginTop: 12 }}>{item.description}</Text>}

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>{t.specs}</Text>
          <View style={styles.specRow}><Text style={styles.specKey}>{t.sku || 'SKU'}</Text><Text style={styles.specVal}>{(item as any)?.sku ?? item?.sku ?? '—'}</Text></View>
          <View style={styles.specRow}><Text style={styles.specKey}>{t.supplier || 'Supplier'}</Text><Text style={styles.specVal}>{item?.supplier || '—'}</Text></View>
          {item?.minOrderQty && (
            <View style={styles.specRow}>
              <Text style={styles.specKey}>{t.minOrderQty || 'Minimum Order'}</Text>
              <Text style={styles.specVal}>{item.minOrderQty}</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>{t.quantity}</Text>
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
              const message = (t.cannotAddMore || 'Cannot add more than {count} items').replace('{count}', String(item.stock));
              setToastMessage(message);
              setShowToast(true);
              setTimeout(() => setShowToast(false), TIMING.TOAST_DURATION);
              return;
            }
            // Pass supplierId when adding to cart to group items by supplier
            await add(item.id, qty, item.supplierId);
            setToastMessage(t.addedToCart || 'Added to cart');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
          }}
          style={styles.addBtn}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>{t.add}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onBack} style={{ marginTop: 12 }}>
          <Text style={{ color: '#2563eb', textAlign: 'center' }}>{t.back}</Text>
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

