import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { styles } from '../../styles/supplier/StockEditModal.styles';

export default function StockEditModal({ visible, onClose, current, onSubmit } : { visible: boolean; onClose: () => void; current: number; onSubmit: (newStock: number) => Promise<void> }) {
  const [value, setValue] = useState(String(current ?? '0'));
  const [loading, setLoading] = useState(false);

  React.useEffect(() => { setValue(String(current ?? '0')); }, [visible, current]);

  const submit = async () => {
    const n = Number(value || 0);
    if (isNaN(n) || n < 0) return;
    try {
      setLoading(true);
      Keyboard.dismiss();
      await onSubmit(n);
      setLoading(false);
      onClose();
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Edit stock</Text>
          <TextInput keyboardType="number-pad" value={value} onChangeText={setValue} style={styles.input} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
            <TouchableOpacity onPress={onClose} style={{ padding: 8, marginRight: 8 }}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={submit} style={[styles.submit, loading && { opacity: 0.6 }]} disabled={loading}><Text style={{ color: '#fff' }}>{loading ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

