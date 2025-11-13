import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

type Language = 'en' | 'ru';

const translations: Record<Language, {
  signIn: string;
  email: string;
  password: string;
  continue: string;
  consumer: string;
  supplier: string;
  selectRole: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
}> = {
  en: {
    signIn: 'Sign In',
    email: 'Email',
    password: 'Password',
    continue: 'Continue',
    consumer: 'Consumer',
    supplier: 'Supplier',
    selectRole: 'Select your role',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
  },
  ru: {
    signIn: 'Вход',
    email: 'Email',
    password: 'Пароль',
    continue: 'Продолжить',
    consumer: 'Потребитель',
    supplier: 'Поставщик',
    selectRole: 'Выберите роль',
    emailPlaceholder: 'Введите email',
    passwordPlaceholder: 'Введите пароль',
  },
};

interface SignInScreenProps {
  language?: Language;
  onSignIn?: (role: 'consumer' | 'supplier') => void;
  onRegister?: () => void;
}

export default function SignInScreen({ language = 'en', onSignIn, onRegister }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'consumer' | 'supplier' | null>(null);
  const t = translations[language];

  const handleContinue = () => {
    if (selectedRole && email && password && onSignIn) {
      onSignIn(selectedRole);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Header inside SafeAreaView */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{t.signIn}</Text>
      </View>
      <View style={styles.body}>
        {/* Role Selection */}
        <Text style={styles.label}>{t.selectRole}</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'consumer' && styles.roleButtonSelected]}
            onPress={() => setSelectedRole('consumer')}
          >
            <FontAwesome5 name="user" size={24} color={selectedRole === 'consumer' ? '#2563eb' : '#a1a1aa'} style={{ marginBottom: 4 }} />
            <Text style={[styles.roleText, selectedRole === 'consumer' && styles.roleTextSelected]}>{t.consumer}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'supplier' && styles.roleButtonSelected]}
            onPress={() => setSelectedRole('supplier')}
          >
            <MaterialIcons name="business" size={24} color={selectedRole === 'supplier' ? '#2563eb' : '#a1a1aa'} style={{ marginBottom: 4 }} />
            <Text style={[styles.roleText, selectedRole === 'supplier' && styles.roleTextSelected]}>{t.supplier}</Text>
          </TouchableOpacity>
        </View>
        {/* Email */}
        <Text style={styles.label}>{t.email}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {/* Password */}
        <Text style={styles.label}>{t.password}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.passwordPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, (!selectedRole || !email || !password) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedRole || !email || !password}
        >
          <Text style={styles.continueButtonText}>{t.continue}</Text>
        </TouchableOpacity>
        {/* Register link (consumers only) */}
        {typeof (onRegister) === 'function' && (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => onRegister && onRegister()}>
              <Text style={{ color: '#2563eb' }}>Don't have an account? Register</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56, // Increased padding for better visibility
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '500',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  roleButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  roleText: {
    fontSize: 14,
    color: '#374151',
  },
  roleTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  continueButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    opacity: 1,
  },
});
