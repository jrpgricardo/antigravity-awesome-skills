/**
 * PDF Generation Component using @react-pdf/renderer
 *
 * This component renders a professional PDF version of a proposal.
 * Usage: import and render with <PDFDownloadLink> or <BlobProvider>
 *
 * Example:
 *   import { PDFDownloadLink } from '@react-pdf/renderer';
 *   import { ProposalPDF } from './ProposalPDF';
 *
 *   <PDFDownloadLink document={<ProposalPDF proposal={proposal} />} fileName="proposta.pdf">
 *     {({ loading }) => loading ? 'Gerando PDF...' : 'Baixar PDF'}
 *   </PDFDownloadLink>
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Proposal, Organization } from '@/types';

// Register Inter font (optional - uses default sans-serif if not available)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    padding: 40,
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#3B82F6',
  },
  companyDetails: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  colDesc: { width: '40%' },
  colType: { width: '15%' },
  colPrice: { width: '15%', textAlign: 'right' },
  colQty: { width: '10%', textAlign: 'center' },
  colTotal: { width: '20%', textAlign: 'right' },
  headerText: {
    fontSize: 8,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  totalSection: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 600,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 700,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#3B82F6',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  description: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  validUntil: {
    fontSize: 9,
    color: '#f59e0b',
    marginTop: 4,
  },
});

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const pricingLabels: Record<string, string> = {
  hourly: 'Por Hora',
  fixed: 'Fixo',
  monthly_retainer: 'Mensal',
  per_sprint: 'Sprint',
  custom: 'Custom',
};

interface ProposalPDFProps {
  proposal: Proposal;
  organization?: Organization;
}

export function ProposalPDF({ proposal, organization }: ProposalPDFProps) {
  const org = organization ?? proposal.organization;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.companyName, org?.primary_color ? { color: org.primary_color } : {}]}>
              {org?.name ?? 'Empresa'}
            </Text>
            <Text style={styles.companyDetails}>
              {org?.email}{org?.phone ? ` | ${org.phone}` : ''}
            </Text>
            {org?.website && <Text style={styles.companyDetails}>{org.website}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 8, color: '#6b7280' }}>PROPOSTA COMERCIAL</Text>
            <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 2 }}>
              {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{proposal.title}</Text>
        <Text style={styles.subtitle}>
          Para: {proposal.client?.company_name ?? 'Cliente'}
          {proposal.client?.contact_name ? ` (${proposal.client.contact_name})` : ''}
        </Text>
        {proposal.valid_until && (
          <Text style={styles.validUntil}>
            Valida ate: {new Date(proposal.valid_until).toLocaleDateString('pt-BR')}
          </Text>
        )}

        {/* Description */}
        {proposal.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{proposal.description}</Text>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escopo e Valores</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.colDesc]}>DESCRICAO</Text>
              <Text style={[styles.headerText, styles.colType]}>TIPO</Text>
              <Text style={[styles.headerText, styles.colPrice]}>PRECO</Text>
              <Text style={[styles.headerText, styles.colQty]}>QTD</Text>
              <Text style={[styles.headerText, styles.colTotal]}>TOTAL</Text>
            </View>
            {proposal.items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={[styles.colType, { fontSize: 9, color: '#6b7280' }]}>
                  {pricingLabels[item.pricing_type] ?? item.pricing_type}
                </Text>
                <Text style={styles.colPrice}>{formatBRL(item.unit_price)}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={[styles.colTotal, { fontWeight: 600 }]}>{formatBRL(item.total)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatBRL(proposal.total_value)}</Text>
            </View>
            {(proposal.discount_percentage > 0 || proposal.discount_value > 0) && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#ef4444' }]}>Desconto</Text>
                <Text style={[styles.totalValue, { color: '#ef4444' }]}>
                  -{formatBRL(proposal.total_value - proposal.final_value)}
                </Text>
              </View>
            )}
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{formatBRL(proposal.final_value)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Proposta gerada por PropostaApp | {org?.name} | {org?.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
