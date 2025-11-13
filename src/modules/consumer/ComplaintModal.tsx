import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';

export default function ComplaintModal({ visible, onClose, onSubmit, title = 'Report an issue', initialValue = '' }: { visible: boolean; onClose: () => void; onSubmit: (reason: string) => Promise<void>; title?: string; initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  // reset value when modal opens/closes
  React.useEffect(() => { setValue(initialValue ?? ''); }, [visible, initialValue]);

  const doSubmit = async () => {
    try {
      setSubmitting(true);
      Keyboard.dismiss();
      await onSubmit(value || '');
      setSubmitting(false);
      onClose();
    } catch (e) {
      setSubmitting(false);
      // bubble up; caller may show toast
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" presentationStyle="overFullScreen" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Describe the issue (optional)"
            multiline
            style={styles.input}
            textAlignVertical="top"
            accessibilityLabel="complaint-input"
          />
          <View style={styles.row}>
            <TouchableOpacity onPress={() => { setValue(''); onClose(); }} style={styles.cancel}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={doSubmit} style={styles.submit} disabled={submitting}>
              <Text style={{ color: '#fff' }}>{submitting ? 'Submitting...' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, minHeight: 80 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  cancel: { padding: 8, marginRight: 8 },
  submit: { padding: 8, backgroundColor: '#b91c1c', borderRadius: 8 }
});
