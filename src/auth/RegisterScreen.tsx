import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { toastShow } from '../helpers/toast';
import { auth } from '../api';

type Language = 'en' | 'ru';

const translations: Record<Language, any> = {
  en: {
    title: 'Register',
    name: 'Full name',
    email: 'Email',
    password: 'Password',
    register: 'Create account',
    haveAccount: 'Already have an account? Sign in',
  },
  ru: {
    title: '\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f',
    name: '\u041f\u043e\u043b\u043d\u043e\u0435 \u0438\u043c\u044f',
    email: 'Email',
    password: '\u041f\u0430\u0440\u043e\u043b\u044c',
    register: '\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c',
    haveAccount: '\u0415\u0441\u043b\u0438 \u0443 \u0412\u0430\u0441 \u0435\u0441\u0442\u044c \u0430\u043a\u043a\u0430\u0443\u043d\u0442? \u0412\u043e\u0439\u0442\u0435\u0020\u0432\u0445\u043e\u0434',
  },
};

interface Props {
  language?: Language;
  onRegistered?: (user: any) => void;
  onCancel?: () => void;
}

export default function RegisterScreen({ language = 'en', onRegistered, onCancel }: Props) {
  const t = translations[language];
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Live validation states
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordChecks = {
    minLength: (s: string) => s.length >= 8,
    upper: (s: string) => /[A-Z]/.test(s),
    lower: (s: string) => /[a-z]/.test(s),
    digitOrSymbol: (s: string) => /[0-9_!@#$%^&*()\-+=]/.test(s),
  };

  React.useEffect(() => {
    setEmailValid(email.length === 0 ? null : emailRegex.test(email));
  }, [email]);

  React.useEffect(() => {
    if (password.length === 0) return setPasswordValid(null);
    const ok = passwordChecks.minLength(password) && passwordChecks.upper(password) && passwordChecks.lower(password) && passwordChecks.digitOrSymbol(password);
    setPasswordValid(ok);
  }, [password]);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      toastShow('Validation', 'All fields are required');
      return;
    }
    if (!emailRegex.test(email)) {
      toastShow('Validation', 'Please enter a valid email address');
      return;
    }
    if (!passwordChecks.minLength(password) || !passwordChecks.upper(password) || !passwordChecks.lower(password) || !passwordChecks.digitOrSymbol(password)) {
      toastShow('Validation', 'Password must be 8+ chars with upper, lower and a number or symbol');
      return;
    }
    setLoading(true);
    try {
  const res: any = await (auth as any).registerConsumer({ firstName, lastName, email, password });
      toastShow('Welcome', 'Account created');
      if (onRegistered) onRegistered(res.user || res);
    } catch (e: any) {
      const msg = e?.message || 'Registration failed';
      toastShow('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>First name</Text>
        <TextInput value={firstName} onChangeText={setFirstName} style={styles.input} placeholder="First name" />
        <Text style={styles.label}>Last name</Text>
        <TextInput value={lastName} onChangeText={setLastName} style={styles.input} placeholder="Last name" />
        <Text style={styles.label}>{t.email}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput value={email} onChangeText={setEmail} style={[styles.input, { flex: 1 }]} placeholder={t.email} keyboardType="email-address" autoCapitalize="none" />
          {emailValid === true && <Text style={{ color: 'green', marginLeft: 8 }}>✓</Text>}
          {emailValid === false && <Text style={{ color: 'red', marginLeft: 8 }}>✕</Text>}
        </View>
        <Text style={styles.label}>{t.password}</Text>
        <TextInput value={password} onChangeText={setPassword} style={styles.input} placeholder={t.password} secureTextEntry />
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 12, color: passwordValid ? 'green' : '#6b7280' }}>
            {passwordChecks.minLength(password) ? '✓' : '✕'} At least 8 characters
          </Text>
          <Text style={{ fontSize: 12, color: passwordChecks.upper(password) ? 'green' : '#6b7280' }}>
            {passwordChecks.upper(password) ? '✓' : '✕'} One uppercase letter
          </Text>
          <Text style={{ fontSize: 12, color: passwordChecks.lower(password) ? 'green' : '#6b7280' }}>
            {passwordChecks.lower(password) ? '✓' : '✕'} One lowercase letter
          </Text>
          <Text style={{ fontSize: 12, color: passwordChecks.digitOrSymbol(password) ? 'green' : '#6b7280' }}>
            {passwordChecks.digitOrSymbol(password) ? '✓' : '✕'} One number or symbol
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.register}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={onCancel}>
          <Text style={{ color: '#2563eb', textAlign: 'center' }}>{t.haveAccount}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 16, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '600' },
  body: { padding: 24, flex: 1 },
  label: { fontSize: 14, color: '#374151', marginBottom: 6 },
  input: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, backgroundColor: '#fff', marginBottom: 8 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  button: { height: 48, borderRadius: 8, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
