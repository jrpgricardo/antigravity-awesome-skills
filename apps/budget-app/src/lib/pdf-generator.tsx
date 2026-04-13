import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency } from '@/utils/currency';
import { PRICING_TYPES, PROPOSAL_STATUSES } from './constants';
import type { Proposal, ProposalItem } from '@/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '2 solid #000',
    paddingBottom: 5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    padding: 8,
  },
  col1: { width: '40%' },
  col2: { width: '15%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '15%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #000',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  text: {
    marginBottom: 5,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
});

interface ProposalPDFProps {
  proposal: Proposal & { items: ProposalItem[] };
  organizationName?: string;
}

export function ProposalPDF({ proposal, organizationName = 'Budget App' }: ProposalPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{proposal.title}</Text>
          <Text style={styles.subtitle}>Proposta Comercial</Text>
          <Text style={styles.subtitle}>
            Data: {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
          </Text>
          <Text style={styles.subtitle}>
            Validade: {proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('pt-BR') : 'Não especificada'}
          </Text>
          <Text style={styles.subtitle}>
            Status: {PROPOSAL_STATUSES[proposal.status].label}
          </Text>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={styles.text}>Empresa: {proposal.client?.company_name}</Text>
          <Text style={styles.text}>Contato: {proposal.client?.contact_name}</Text>
          <Text style={styles.text}>Email: {proposal.client?.email}</Text>
          {proposal.client?.phone && (
            <Text style={styles.text}>Telefone: {proposal.client.phone}</Text>
          )}
        </View>

        {/* Introduction */}
        {proposal.introduction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Introdução</Text>
            <Text style={styles.text}>{proposal.introduction}</Text>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens da Proposta</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Descrição</Text>
              <Text style={styles.col2}>Tipo</Text>
              <Text style={styles.col3}>Valor Unit.</Text>
              <Text style={styles.col4}>Qtd</Text>
              <Text style={styles.col5}>Total</Text>
            </View>
            {proposal.items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{item.description}</Text>
                <Text style={styles.col2}>{PRICING_TYPES[item.pricing_type]}</Text>
                <Text style={styles.col3}>{formatCurrency(item.unit_price)}</Text>
                <Text style={styles.col4}>{item.quantity}</Text>
                <Text style={styles.col5}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(proposal.total_value)}</Text>
          </View>
        </View>

        {/* Terms */}
        {proposal.terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Termos e Condições</Text>
            <Text style={styles.text}>{proposal.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{organizationName}</Text>
          <Text>Proposta gerada em {new Date().toLocaleDateString('pt-BR')}</Text>
        </View>
      </Page>
    </Document>
  );
}
