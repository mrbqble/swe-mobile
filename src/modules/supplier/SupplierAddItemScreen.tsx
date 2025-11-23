import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/supplier/SupplierAddItemScreen.styles';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { chat, product } from '../../api';
import { toastShow } from '../../helpers/toast';
import { getTranslations, type Language } from '../../translations';

export default function SupplierAddItemScreen({ language = 'en', navigateTo, supplierName }: { language?: 'en' | 'ru'; navigateTo?: (s: string) => void; supplierName?: string }) {
  const t = getTranslations('supplier', 'addItem', language ?? 'en');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const canSave = name.trim().length > 0 && price.trim().length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo && navigateTo('supplier-catalog')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{t.addItem}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>{t.productImage}</Text>
        <View style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180, borderRadius: 12 }} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Feather name="camera" size={28} color="#9ca3af" />
            </View>
          )}
          <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity onPress={async () => {
              try {
                const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!perm.granted) return;
                const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: false });
                const uri = (res as any)?.assets?.[0]?.uri || (res as any)?.uri;
                if (!uri) return;
                setImageUri(uri);
                // upload to storage
                setUploading(true);
                try {
                  const uploaded = await chat.uploadAttachment(uri as string);
                  setImageUri(uploaded.url);
                  try { toastShow('Uploaded', 'Image uploaded'); } catch (e) {}
                } catch (e) {
                  try { toastShow('Upload failed', 'Could not upload image — preview will be used'); } catch (e) {}
                  // keep local uri as preview
                } finally { setUploading(false); }
              } catch (e) {}
            }} style={styles.smallBtn}><Text>{t.upload}</Text></TouchableOpacity>
            <TouchableOpacity onPress={async () => {
              try {
                const perm = await ImagePicker.requestCameraPermissionsAsync();
                if (!perm.granted) return;
                const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: false });
                const uri = (res as any)?.assets?.[0]?.uri || (res as any)?.uri;
                if (!uri) return;
                setImageUri(uri);
                setUploading(true);
                try {
                  const uploaded = await chat.uploadAttachment(uri as string);
                  setImageUri(uploaded.url);
                  try { toastShow('Uploaded', 'Image uploaded'); } catch (e) {}
                } catch (e) {
                  try { toastShow('Upload failed', 'Could not upload image — preview will be used'); } catch (e) {}
                } finally { setUploading(false); }
              } catch (e) {}
            }} style={[styles.smallBtn, { marginLeft: 12 }]}><Text>{t.takePhoto}</Text></TouchableOpacity>
          </View>
        </View>
        {uploading && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 100, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={{ marginTop: 8, color: '#6b7280' }}>Uploading...</Text>
          </View>
        )}

        <Text style={{ marginTop: 12 }}>{t.productName}</Text>
        <TextInput value={name} onChangeText={setName} placeholder={t.productName} style={styles.input} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ marginTop: 12 }}>{t.price}</Text>
            <TextInput value={price} onChangeText={setPrice} placeholder={t.price} keyboardType="numeric" style={styles.input} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ marginTop: 12 }}>{t.sku}</Text>
            <TextInput value={sku} onChangeText={setSku} placeholder={t.sku} style={styles.input} />
          </View>
        </View>

        <Text style={{ marginTop: 12 }}>{t.stock}</Text>
        <TextInput value={stock} onChangeText={setStock} placeholder={t.stock} keyboardType="numeric" style={styles.input} />

        <Text style={{ marginTop: 12 }}>{t.description}</Text>
        <TextInput value={description} onChangeText={setDescription} placeholder={t.description} multiline style={[styles.input, { height: 100 }]} />

        <View style={{ height: 24 }} />
        <TouchableOpacity disabled={!canSave || saving} onPress={async () => {
          if (!canSave) return;
          setSaving(true);
            try {
            const p = await (product as any).createProduct({ name, price: Number(price), stock: Number(stock || 0), sku, description, imageUrl: imageUri || '', supplierId: supplierName });
            try { toastShow('Product saved', 'The product has been added to your catalog.'); } catch (e) {}
            navigateTo && navigateTo('supplier-catalog');
          } catch (e) {
            // ignore
          } finally { setSaving(false); }
        }} style={[styles.saveBtn, !canSave ? { backgroundColor: '#e5e7eb' } : {}]}>
          <Text style={{ color: canSave ? '#fff' : '#9ca3af', fontWeight: '700' }}>{t.save}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigateTo && navigateTo('supplier-catalog')} style={styles.cancelBtn}><Text>{t.cancel}</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


