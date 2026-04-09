import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, Modal
} from 'react-native'
import { router } from 'expo-router'
import api from '../src/services/api'

type Category = {
  id: string
  name: string
  type: string
}

type Transaction = {
  id: string
  date: string
  label: string
  amount: number
  type: 'income' | 'expense'
  note?: string
  category: Category
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    label: '',
    amount: '',
    type: 'expense',
    categoryId: '',
    note: ''
  })

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [])

  async function loadTransactions() {
    const res = await api.get('/transactions')
    setTransactions(res.data)
  }

  async function loadCategories() {
    const res = await api.get('/categories')
    setCategories(res.data)
  }

  async function handleSubmit() {
    if (!form.label || !form.amount || !form.categoryId) {
      Alert.alert('Erreur', 'Remplis tous les champs obligatoires')
      return
    }
    await api.post('/transactions', {
      ...form,
      amount: parseFloat(form.amount)
    })
    setForm({
      date: new Date().toISOString().split('T')[0],
      label: '',
      amount: '',
      type: 'expense',
      categoryId: '',
      note: ''
    })
    setShowForm(false)
    loadTransactions()
  }

  async function handleDelete(id: string) {
    Alert.alert(
      'Supprimer',
      'Supprimer cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await api.delete(`/transactions/${id}`)
            loadTransactions()
          }
        }
      ]
    )
  }

  const filteredCategories = categories.filter(c => c.type === form.type)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/dashboard')}>
          <Text style={styles.back}>Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <Text style={styles.addBtn}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <ScrollView style={styles.list}>
        {transactions.length === 0 ? (
          <Text style={styles.empty}>Aucune transaction</Text>
        ) : (
          transactions.map(t => (
            <View key={t.id} style={styles.transactionRow}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionLabel}>{t.label}</Text>
                <Text style={styles.transactionMeta}>
                  {new Date(t.date).toLocaleDateString('fr-FR')} · {t.category.name}
                  {t.note ? ` · ${t.note}` : ''}
                </Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, { color: t.type === 'income' ? '#16A34A' : '#DC2626' }]}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} €
                </Text>
                <TouchableOpacity onPress={() => handleDelete(t.id)}>
                  <Text style={styles.deleteBtn}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal formulaire */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Nouvelle transaction</Text>

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={form.date}
            onChangeText={v => setForm({ ...form, date: v })}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, form.type === 'expense' && styles.typeBtnActive]}
              onPress={() => setForm({ ...form, type: 'expense', categoryId: '' })}
            >
              <Text style={[styles.typeBtnText, form.type === 'expense' && styles.typeBtnTextActive]}>
                Dépense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, form.type === 'income' && styles.typeBtnActive]}
              onPress={() => setForm({ ...form, type: 'income', categoryId: '' })}
            >
              <Text style={[styles.typeBtnText, form.type === 'income' && styles.typeBtnTextActive]}>
                Revenu
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Libellé</Text>
          <TextInput
            style={styles.input}
            value={form.label}
            onChangeText={v => setForm({ ...form, label: v })}
            placeholder="Ex: Courses Lidl"
          />

          <Text style={styles.label}>Montant (€)</Text>
          <TextInput
            style={styles.input}
            value={form.amount}
            onChangeText={v => setForm({ ...form, amount: v })}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Catégorie</Text>
          {filteredCategories.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.categoryBtn, form.categoryId === c.id && styles.categoryBtnActive]}
              onPress={() => setForm({ ...form, categoryId: c.id })}
            >
              <Text style={[styles.categoryBtnText, form.categoryId === c.id && styles.categoryBtnTextActive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Note (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={form.note}
            onChangeText={v => setForm({ ...form, note: v })}
            placeholder="Commentaire..."
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
  back: { fontSize: 13, color: '#2563EB' },
  headerTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  addBtn: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  list: { flex: 1 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 14 },
  transactionRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  transactionInfo: { flex: 1 },
  transactionLabel: { fontSize: 14, fontWeight: '500', color: '#111827' },
  transactionMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 14, fontWeight: '600' },
  deleteBtn: { fontSize: 11, color: '#EF4444', marginTop: 4 },
  modal: { flex: 1, padding: 24, paddingTop: 48 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827'
  },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  typeBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  typeBtnText: { fontSize: 14, color: '#6B7280' },
  typeBtnTextActive: { color: '#fff', fontWeight: '600' },
  categoryBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6
  },
  categoryBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  categoryBtnText: { fontSize: 13, color: '#6B7280' },
  categoryBtnTextActive: { color: '#2563EB', fontWeight: '500' },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24
  },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  cancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#6B7280', fontSize: 14 }
})