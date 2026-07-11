import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView,
  StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { DEFAULT_GOALS, createEntry, progress, summarize } from './domain';
import { loadEntries, saveEntries } from './storage';

const COLORS = { ink: '#17221B', muted: '#68746C', green: '#207A4A', mint: '#DDF3E6', cream: '#F7F5EE', white: '#FFFFFF', coral: '#E96B4B' };

function ProgressCard({ label, value, goal, unit, color }) {
  const ratio = progress(value, goal);
  return (
    <View style={styles.progressCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardValue}>{value.toLocaleString()} / {goal.toLocaleString()} {unit}</Text>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

function EntryForm({ type, onAdd }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const isMeal = type === 'meal';
  const submit = () => {
    try {
      onAdd(createEntry(type, { name, amount }));
      setName(''); setAmount('');
    } catch (error) { Alert.alert('입력 확인', error.message); }
  };
  return (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>{isMeal ? '식단 기록' : '운동 기록'}</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={isMeal ? '예: 닭가슴살 샐러드' : '예: 빠르게 걷기'} placeholderTextColor="#98A099" />
      <View style={styles.formRow}>
        <TextInput style={[styles.input, styles.amountInput]} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder={isMeal ? '칼로리' : '운동 시간'} placeholderTextColor="#98A099" />
        <Pressable accessibilityRole="button" style={styles.addButton} onPress={submit}><Text style={styles.addButtonText}>추가</Text></Pressable>
      </View>
      <Text style={styles.hint}>{isMeal ? '섭취 열량을 kcal로 입력하세요.' : '운동 시간을 분 단위로 입력하세요.'}</Text>
    </View>
  );
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('meal');
  useEffect(() => { loadEntries().then(setEntries).finally(() => setReady(true)); }, []);
  useEffect(() => { if (ready) saveEntries(entries).catch(() => Alert.alert('저장 실패', '기록을 저장하지 못했습니다.')); }, [entries, ready]);
  const summary = useMemo(() => summarize(entries), [entries]);
  const todayEntries = entries.filter((entry) => new Date(entry.createdAt).toDateString() === new Date().toDateString());
  const addEntry = (entry) => setEntries((current) => [entry, ...current]);
  const removeEntry = (id) => Alert.alert('기록 삭제', '이 기록을 삭제할까요?', [
    { text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: () => setEntries((current) => current.filter((item) => item.id !== id)) },
  ]);
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={todayEntries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          ListHeaderComponent={<>
            <Text style={styles.eyebrow}>TODAY</Text><Text style={styles.title}>오늘도 가볍게, 꾸준하게.</Text>
            <Text style={styles.subtitle}>식사와 운동을 기록하고 하루의 균형을 확인하세요.</Text>
            <ProgressCard label="섭취 칼로리" value={summary.calories} goal={DEFAULT_GOALS.calories} unit="kcal" color={COLORS.coral} />
            <ProgressCard label="운동 시간" value={summary.exerciseMinutes} goal={DEFAULT_GOALS.exerciseMinutes} unit="분" color={COLORS.green} />
            <View style={styles.tabs}>
              {['meal', 'workout'].map((item) => <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.activeTab]}><Text style={[styles.tabText, tab === item && styles.activeTabText]}>{item === 'meal' ? '식단' : '운동'}</Text></Pressable>)}
            </View>
            <EntryForm type={tab} onAdd={addEntry} />
            <Text style={[styles.sectionTitle, styles.historyTitle]}>오늘의 기록</Text>
          </>}
          renderItem={({ item }) => <Pressable onLongPress={() => removeEntry(item.id)} style={styles.entry}>
            <View style={[styles.icon, { backgroundColor: item.type === 'meal' ? '#FCE4DC' : COLORS.mint }]}><Text>{item.type === 'meal' ? '🥗' : '🏃'}</Text></View>
            <View style={styles.entryBody}><Text style={styles.entryName}>{item.name}</Text><Text style={styles.entryTime}>{new Date(item.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} · 길게 눌러 삭제</Text></View>
            <Text style={styles.entryAmount}>{item.amount} {item.type === 'meal' ? 'kcal' : '분'}</Text>
          </Pressable>}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>아직 기록이 없어요. 첫 기록을 추가해 보세요.</Text></View>}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 }, content: { padding: 22, paddingBottom: 48 }, eyebrow: { color: COLORS.green, fontSize: 12, fontWeight: '800', letterSpacing: 2, marginTop: 10 },
  title: { color: COLORS.ink, fontSize: 30, lineHeight: 39, fontWeight: '800', marginTop: 8 }, subtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 23, marginTop: 6, marginBottom: 20 },
  progressCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 17, marginBottom: 10 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: COLORS.ink, fontSize: 14, fontWeight: '700' }, cardValue: { color: COLORS.muted, fontSize: 12, fontWeight: '600' }, track: { height: 8, borderRadius: 6, backgroundColor: '#E8ECE8', marginTop: 14, overflow: 'hidden' }, fill: { height: '100%', borderRadius: 6 },
  tabs: { flexDirection: 'row', backgroundColor: '#E9ECE7', borderRadius: 14, padding: 4, marginTop: 14 }, tab: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' }, activeTab: { backgroundColor: COLORS.white }, tabText: { color: COLORS.muted, fontWeight: '700' }, activeTabText: { color: COLORS.green },
  form: { backgroundColor: COLORS.white, padding: 18, borderRadius: 20, marginTop: 12 }, sectionTitle: { color: COLORS.ink, fontSize: 18, fontWeight: '800', marginBottom: 13 }, input: { backgroundColor: '#F1F3EF', borderRadius: 12, paddingHorizontal: 14, height: 48, color: COLORS.ink, fontSize: 15, marginBottom: 9 }, formRow: { flexDirection: 'row', gap: 9 }, amountInput: { flex: 1 }, addButton: { height: 48, paddingHorizontal: 22, borderRadius: 12, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' }, addButtonText: { color: COLORS.white, fontWeight: '800' }, hint: { color: COLORS.muted, fontSize: 12 },
  historyTitle: { marginTop: 26, marginBottom: 10 }, entry: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 13, marginBottom: 8 }, icon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, entryBody: { flex: 1, marginLeft: 12 }, entryName: { color: COLORS.ink, fontSize: 15, fontWeight: '700' }, entryTime: { color: COLORS.muted, fontSize: 11, marginTop: 4 }, entryAmount: { color: COLORS.ink, fontSize: 13, fontWeight: '800' }, empty: { padding: 24, alignItems: 'center' }, emptyText: { color: COLORS.muted, textAlign: 'center' },
});
