import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../src/services/api'

type Summary = {
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: Record<string, { total: number; type: string }>
  transactions: any[]
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const user = await AsyncStorage.getItem('user')
    if (user) setEmail(JSON.parse(user).email)
    const res = await api.get('/summary')
    setSummary(res.data)
    setLoading(false)
  }

  async function handleLogout() {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
    router.replace('/')
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FinTracker</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/transactions')}>
            <Text style={styles.navLink}>Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.userEmail}>{email}</Text>

        {/* Cartes résumé */}
        {summary && (
          <>
            <View style={styles.cards}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Revenus</Text>
                <Text style={[styles.cardAmount, { color: '#16A34A' }]}>
                  +{summary.totalIncome.toFixed(2)} €
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Dépenses</Text>
                <Text style={[styles.cardAmount, { color: '#DC2626' }]}>
                  -{summary.totalExpense.toFixed(2)} €
                </Text>
              </View>
            </View>

            {/* Solde */}
            <View style={[styles.balanceCard, { backgroundColor: summary.balance >= 0 ? '#F0FDF4' : '#FEF2F2' }]}>
              <Text style={styles.cardLabel}>Solde</Text>
              <Text style={[styles.balanceAmount, { color: summary.balance >= 0 ? '#16A34A' : '#DC2626' }]}>
                {summary.balance.toFixed(2)} €
              </Text>
            </View>

            {/* Par catégorie */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Par catégorie</Text>
              {Object.entries(summary.byCategory).map(([name, data]) => (
                <View key={name} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{name}</Text>
                  <Text style={[styles.categoryAmount, { color: data.type === 'income' ? '#16A34A' : '#DC2626' }]}>
                    {data.type === 'income' ? '+' : '-'}{data.total.toFixed(2)} €
                  </Text>
                </View>
              ))}
            </View>

            {/* Dernières transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dernières transactions</Text>
              {summary.transactions.map(t => (
                <View key={t.id} style={styles.transactionRow}>
                  <View>
                    <Text style={styles.transactionLabel}>{t.label}</Text>
                    <Text style={styles.transactionMeta}>
                      {new Date(t.date).toLocaleDateString('fr-FR')} · {t.category.name}
                    </Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: t.type === 'income' ? '#16A34A' : '#DC2626' }]}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} €
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  headerRight: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  navLink: { fontSize: 13, color: '#2563EB', fontWeight: '500' },
  logout: { fontSize: 13, color: '#EF4444' },
  content: { padding: 20 },
  userEmail: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  cards: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  cardLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  cardAmount: { fontSize: 20, fontWeight: 'bold' },
  balanceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  balanceAmount: { fontSize: 24, fontWeight: 'bold' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  categoryName: { fontSize: 13, color: '#4B5563' },
  categoryAmount: { fontSize: 13, fontWeight: '500' },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB'
  },
  transactionLabel: { fontSize: 13, fontWeight: '500', color: '#111827' },
  transactionMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  transactionAmount: { fontSize: 13, fontWeight: '600' }
})