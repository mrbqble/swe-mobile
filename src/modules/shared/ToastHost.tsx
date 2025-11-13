import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastBus } from '../../helpers/toast';

export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<Array<{ id: string; title?: string; message?: string }>>([]);

  useEffect(() => {
    const unsub = toastBus.subscribe((t) => {
      setToasts((s) => [...s, t]);
      // auto remove after 2500ms
      setTimeout(() => {
        setToasts((s) => s.filter(x => x.id !== t.id));
      }, 2500);
    });
    return unsub;
  }, []);

  if (toasts.length === 0) return null;

  const t = toasts[0];

  return (
    <View pointerEvents="box-none" style={[styles.container, { bottom: insets.bottom + 16 }] as any}>
      <View style={styles.toast}>
        {t.title ? <Text style={styles.title}>{t.title}</Text> : null}
        {t.message ? <Text style={styles.message}>{t.message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: { backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, maxWidth: '92%' },
  title: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  message: { color: '#fff' }
});
