import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface LanguagePickerScreenProps {
  onLanguageSelect?: (language: 'en' | 'ru') => void;
}

export default function LanguagePickerScreen({ onLanguageSelect }: LanguagePickerScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.iconCircle}>
          <FontAwesome name="globe" size={32} color="#2563eb" />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Choose Language</Text>
          <Text style={styles.subtitle}>Select your preferred language to continue</Text>
        </View>
        <View style={styles.buttonBlock}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => onLanguageSelect && onLanguageSelect('en')}
          >
            <Text style={styles.buttonPrimaryText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={() => onLanguageSelect && onLanguageSelect('ru')}
          >
            <Text style={styles.buttonOutlineText}>Русский</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  innerContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  buttonBlock: {
    width: '100%',
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  buttonOutlineText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
