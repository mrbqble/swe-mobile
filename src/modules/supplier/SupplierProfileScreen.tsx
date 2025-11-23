import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/supplier/SupplierProfileScreen.styles';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { getTranslations, type Language } from '../../translations';
import { User } from '../../api/user.http';

export default function SupplierProfileScreen({ language = 'en', onLanguageChange, onLogout, navigateTo, supplierName, user }: { language?: 'en' | 'ru'; onLanguageChange?: (l: 'en' | 'ru') => void; onLogout?: () => void; navigateTo?: (s: string) => void; supplierName?: string; user?: User }) {
  const t = getTranslations('supplier', 'profile', language);

  const org = {
    name: supplierName || 'TechPro Supply',
    address: 'Al-Farabi 77/1, Almaty, Kazakhstan',
    phone: '+7 727 123 4567',
    email: 'info@techpro.kz',
    website: 'www.techpro.kz'
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo && navigateTo('supplier-home')} style={{ position: 'absolute', left: 12, top: 12, padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>{t.profile}</Text>
      </View>

      <View style={{ alignItems: 'center', paddingTop: 24 }}>
        <View style={styles.avatar}><MaterialIcons name="apartment" size={28} color="#2563eb" /></View>
        <Text style={{ marginTop: 12, fontWeight: '700', fontSize: 16 }}>{org.name}</Text>
        {user && (
          <Text style={{ color: '#6b7280', marginTop: 4 }}>{user.first_name} {user.last_name}</Text>
        )}
        <Text style={{ color: '#6b7280', marginTop: 4 }}>{t.supplier}</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>{t.organizationInfo}</Text>
        {user && (
          <View style={styles.infoCard}>
            <Text style={{ color: '#6b7280' }}>{t.name}</Text>
            <Text style={{ marginTop: 6, fontWeight: '600' }}>{user.first_name} {user.last_name}</Text>
          </View>
        )}
        {user && (
          <View style={styles.infoCard}>
            <Text style={{ color: '#6b7280' }}>{t.email}</Text>
            <Text style={{ marginTop: 6, fontWeight: '600' }}>{user.email}</Text>
          </View>
        )}
        <View style={styles.infoCard}><Text style={{ color: '#6b7280' }}>{t.companyName}</Text><Text style={{ marginTop: 6, fontWeight: '600' }}>{org.name}</Text></View>
        <View style={styles.infoCard}><Text style={{ color: '#6b7280' }}>{t.address}</Text><Text style={{ marginTop: 6, fontWeight: '600' }}>{org.address}</Text></View>
        <View style={styles.infoCard}><Text style={{ color: '#6b7280' }}>{t.phone}</Text><Text style={{ marginTop: 6, fontWeight: '600' }}>{org.phone}</Text></View>
        <View style={styles.infoCard}><Text style={{ color: '#6b7280' }}>{t.email}</Text><Text style={{ marginTop: 6, fontWeight: '600' }}>{org.email}</Text></View>
        <View style={styles.infoCard}><Text style={{ color: '#6b7280' }}>{t.website}</Text><Text style={{ marginTop: 6, fontWeight: '600' }}>{org.website}</Text></View>

        <Text style={{ fontWeight: '700', marginTop: 16, marginBottom: 8 }}>{t.settings}</Text>
        <View style={[styles.infoCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="globe" size={18} color="#9ca3af" />
            <Text style={{ marginLeft: 8 }}>{t.language}</Text>
          </View>
          <TouchableOpacity onPress={() => onLanguageChange && onLanguageChange(language === 'en' ? 'ru' : 'en')} style={styles.langBtn}>
            <Text>{language === 'en' ? t.english : t.russian}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => onLogout && onLogout()} style={styles.logoutBtn}>
          <Text style={{ color: '#ef4444', fontWeight: '700' }}>{t.logout}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

