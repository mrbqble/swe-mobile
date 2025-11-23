import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../styles/shared/ChatScreen.styles';
import { Feather } from '@expo/vector-icons';
import { useChat } from '../../hooks/useChat';
import { chat, orders } from '../../api';
import { Image, Modal, TextInput as RNTextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { formatDate } from '../../utils/formatters';

export default function ChatScreen({ orderId, onBack, role = 'consumer' }: { orderId: string | null; onBack: () => void; role?: 'consumer' | 'supplier' }) {
  const { messages, loading, refresh } = useChat(orderId, role);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<any>>(null);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!orderId) return;
      try {
        const o = await orders.fetchOrderById(orderId);
        if (mounted) setOrderInfo(o);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, [orderId]);

  useEffect(() => { if (listRef.current) { setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120); } }, [messages.length]);

  const handleSend = async () => {
    if (!orderId || text.trim().length === 0) return;
    const from = role === 'supplier' ? 'supplier' : 'consumer';
      try {
        await chat.sendMessage(orderId, from, text.trim(), []);
        setText('');
        await refresh();
      } catch (e) {}
  };

  // attachments modal state
  const [attModalVisible, setAttModalVisible] = useState(false);
  const [attUrl, setAttUrl] = useState('');
  const [attName, setAttName] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handleAttach = async () => {
    if (!orderId || !attUrl.trim()) { setAttModalVisible(false); return; }
    const from = role === 'supplier' ? 'supplier' : 'consumer';
      try {
        await chat.sendMessage(orderId, from, attName || undefined, [{ url: attUrl.trim(), type: undefined }]);
        setAttUrl(''); setAttName(''); setAttModalVisible(false);
        await refresh();
      } catch (e) { setAttModalVisible(false); }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: false });
      const uri = (res as any)?.assets?.[0]?.uri || (res as any)?.uri;
      if (!uri) return;
      // upload to server storage
        try {
          const uploaded = await chat.uploadAttachment(uri as string);
          const from = role === 'supplier' ? 'supplier' : 'consumer';
          // include previewUri so UI can render the local file immediately while URL is a hosted link
          await chat.sendMessage(orderId!, from, undefined, [{ url: uploaded.url, type: 'image', previewUri: uri }]);
          await refresh();
        } catch (e) {
          // fallback to send local uri if upload fails
          const from = role === 'supplier' ? 'supplier' : 'consumer';
          await chat.sendMessage(orderId!, from, undefined, [{ url: uri, type: 'image', previewUri: uri }]);
          await refresh();
        }
      setAttModalVisible(false);
    } catch (e) { setAttModalVisible(false); }
  };

  const renderItem = ({ item }: any) => (
    item.system ? (
      <View style={{ alignItems: 'center', marginVertical: 8 }}>
        <View style={[styles.systemBlock, item.severity === 'error' ? styles.systemError : item.severity === 'warning' ? styles.systemWarning : item.severity === 'success' ? styles.systemSuccess : styles.systemInfo]}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      </View>
    ) : (
      <View style={[styles.msgRow, item.from === 'supplier' ? styles.msgRowRight : styles.msgRowLeft]}>
        <View style={[styles.msgBubble, item.from === 'supplier' ? styles.msgBubbleRight : styles.msgBubbleLeft]}>
          {/* sender header: avatar + label */}
          <View style={styles.senderRow}>
            <View style={[styles.avatar, item.from === role ? styles.avatarYou : styles.avatarOther]}>
              <Text style={[styles.avatarText, item.from === role ? styles.avatarTextYou : styles.avatarTextOther]}>{item.from === role ? 'You' : (item.from === 'supplier' ? 'S' : 'C')}</Text>
            </View>
            <Text style={[styles.senderLabel, item.from === role ? styles.senderLabelYou : styles.senderLabelOther]}>{item.from === role ? 'You' : (item.from === 'supplier' ? 'Supplier' : 'Consumer')}</Text>
          </View>
    {item.text ? <Text style={item.from === 'supplier' ? styles.msgTextRight : styles.msgTextLeft}>{item.text}</Text> : null}
        {/* attachments */}
        {item.attachments && item.attachments.length > 0 ? (
          <View style={{ marginTop: 8 }}>
            {item.attachments.map((a: any, idx: number) => {
              const src = (a.previewUri || a.url) as string;
              const isImage = !!src && (src.match(/\.(jpg|jpeg|png|gif)$/i) || a.type === 'image' || src.startsWith('file:'));
              if (!src) return null;
              return isImage ? (
                <TouchableOpacity key={String(idx) + '_' + src} onPress={() => { setPreviewUri(src); setPreviewVisible(true); }}>
                  <Image source={{ uri: src }} style={{ width: 160, height: 120, borderRadius: 6, marginVertical: 6 }} />
                </TouchableOpacity>
              ) : (
                <Text key={String(idx) + '_' + src} style={{ color: '#2563eb' }}>{a.url}</Text>
              );
            })}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.msgTs}>{formatRelativeTime(item.ts)}</Text>
          {item.from === role ? <Text style={{ fontSize: 11, color: item.read ? '#059669' : '#6b7280', marginLeft: 8 }}>{item.read ? 'Read' : item.delivered ? 'Delivered' : ''}</Text> : null}
        </View>
      </View>
      </View>
    )
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700' }}>{orderInfo?.customer || orderInfo?.supplier || `Chat`}</Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>{orderInfo ? `Order #${orderInfo.orderNumber}` : ''}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={renderItem}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <View style={styles.composer}>
          <TouchableOpacity onPress={() => setAttModalVisible(true)} style={{ padding: 8 }}><Feather name="paperclip" size={20} color="#9ca3af" /></TouchableOpacity>
          <TextInput value={text} onChangeText={setText} placeholder="Type a message..." style={styles.input} />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}><Feather name="send" size={18} color="#fff" /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={attModalVisible} animationType="slide" transparent>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ width: '92%', backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Attach URL</Text>
            <RNTextInput placeholder="Attachment URL (http://...)" value={attUrl} onChangeText={setAttUrl} style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 8, borderRadius: 8, marginBottom: 8 }} />
            <RNTextInput placeholder="Optional name" value={attName} onChangeText={setAttName} style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 8, borderRadius: 8, marginBottom: 12 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <TouchableOpacity onPress={pickImage} style={{ padding: 8, backgroundColor: '#f3f4f6', borderRadius: 8 }}><Text>Pick Image</Text></TouchableOpacity>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => setAttModalVisible(false)} style={{ padding: 8, marginRight: 8 }}><Text>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleAttach} style={{ padding: 8, backgroundColor: '#2563eb', borderRadius: 8 }}><Text style={{ color: '#fff' }}>Attach</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Preview modal for tapped images */}
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

function formatRelativeTime(iso?: string) {
  if (!iso) return '';
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  } catch (e) { return formatDate(iso); }
}

