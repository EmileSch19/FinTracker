import {
  Document, Page, Text, View, StyleSheet
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#fff'
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827'
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  card: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 14,
    border: '1px solid #E5E7EB'
  },
  cardLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  income: { color: '#16A34A' },
  expense: { color: '#DC2626' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  colDate: { width: '18%', fontSize: 9, color: '#6B7280' },
  colLabel: { width: '34%', fontSize: 9, color: '#111827' },
  colCategory: { width: '22%', fontSize: 9, color: '#6B7280' },
  colType: { width: '12%', fontSize: 9, color: '#6B7280' },
  colAmount: { width: '14%', fontSize: 9, textAlign: 'right' },
  colHeader: { fontSize: 9, fontWeight: 'bold', color: '#374151' },
  footer: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12
  },
  footerText: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center'
  }
})

type Props = {
  from: string
  to: string
  totalIncome: number
  totalExpense: number
  balance: number
  transactions: any[]
}

export default function TransactionsPDF({ from, to, totalIncome, totalExpense, balance, transactions }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>FinTracker — Résumé financier</Text>
          <Text style={styles.subtitle}>
            Période : {from} au {to} · Généré le {new Date().toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {/* Cartes résumé */}
        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Revenus</Text>
            <Text style={[styles.cardAmount, styles.income]}>
              +{totalIncome.toFixed(2)} €
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Dépenses</Text>
            <Text style={[styles.cardAmount, styles.expense]}>
              -{totalExpense.toFixed(2)} €
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Solde</Text>
            <Text style={[styles.cardAmount, balance >= 0 ? styles.income : styles.expense]}>
              {balance.toFixed(2)} €
            </Text>
          </View>
        </View>

        {/* Tableau des transactions */}
        <Text style={styles.sectionTitle}>Détail des transactions</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.colDate, styles.colHeader]}>Date</Text>
          <Text style={[styles.colLabel, styles.colHeader]}>Libellé</Text>
          <Text style={[styles.colCategory, styles.colHeader]}>Catégorie</Text>
          <Text style={[styles.colType, styles.colHeader]}>Type</Text>
          <Text style={[styles.colAmount, styles.colHeader]}>Montant</Text>
        </View>

        {transactions.map(t => (
          <View key={t.id} style={styles.tableRow}>
            <Text style={styles.colDate}>
              {new Date(t.date).toLocaleDateString('fr-FR')}
            </Text>
            <Text style={styles.colLabel}>{t.label}</Text>
            <Text style={styles.colCategory}>{t.category.name}</Text>
            <Text style={styles.colType}>
              {t.type === 'income' ? 'Revenu' : 'Dépense'}
            </Text>
            <Text style={[styles.colAmount, t.type === 'income' ? styles.income : styles.expense]}>
              {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} €
            </Text>
          </View>
        ))}

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            FinTracker · Document généré automatiquement · {transactions.length} transaction(s)
          </Text>
        </View>

      </Page>
    </Document>
  )
}