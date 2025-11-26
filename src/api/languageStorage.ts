import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'APP_LANGUAGE';

export type Language = 'en' | 'ru';

/**
 * Save language preference to AsyncStorage
 */
export async function setLanguage(language: Language): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}

/**
 * Get language preference from AsyncStorage
 * Returns null if no language is stored
 */
export async function getLanguage(): Promise<Language | null> {
  const language = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (language === 'en' || language === 'ru') {
    return language;
  }
  return null;
}

/**
 * Clear language preference from AsyncStorage
 */
export async function clearLanguage(): Promise<void> {
  await AsyncStorage.removeItem(LANGUAGE_KEY);
}

