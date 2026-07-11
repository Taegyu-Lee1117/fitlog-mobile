import AsyncStorage from '@react-native-async-storage/async-storage';

const ENTRIES_KEY = 'fitlog.entries.v1';

export async function loadEntries() {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries) {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}
