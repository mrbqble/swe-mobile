import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { styles } from '../../styles/shared/ToastHost.styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastBus } from '../../helpers/toast';
import { TIMING } from '../../constants';

export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<Array<{ id: string; title?: string; message?: string }>>([]);
  const timeoutRefs = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const unsub = toastBus.subscribe((t) => {
      setToasts((s) => [...s, t]);
      // auto remove after configured duration
      const timeoutId = setTimeout(() => {
        setToasts((s) => s.filter(x => x.id !== t.id));
        timeoutRefs.current.delete(t.id);
      }, TIMING.TOAST_DURATION);
      timeoutRefs.current.set(t.id, timeoutId);
    });
    return () => {
      unsub();
      // Clear all pending timeouts on unmount
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
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

