import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
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
    alignItems: 'center',
  },
  bodyContent: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
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
  continueButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
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

