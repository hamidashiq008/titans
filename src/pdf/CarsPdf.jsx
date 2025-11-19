import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  logo: {
    width: 80,
    height: 40,
  },
  titleBlock: {
    textAlign: 'right',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom:'10px',
  },
  subtitle: {
    fontSize: 9,
    color: '#6B7280',
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
    color: '#374151',
    width: '40%',
  },
  value: {
    color: '#1F2937',
    width: '58%',
    textAlign: 'right',
  },
  statusBadge: {
    fontSize: 9,
    color: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  images: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  thumb: {
    width: 140,
    height: 100,
    objectFit: 'cover',
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
  },
  swatch: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 3,
    marginRight: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 28,
    right: 28,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 9,
  },
});

// Helper functions
const normalizeColor = (value) => {
  if (!value || typeof value !== 'string') return '#FFFFFF';
  const v = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
  return '#FFFFFF';
};

const extractImageUrls = (car) => {
  const urls = car?.image_urls || car?.images?.[0]?.image_urls || [];
  return Array.isArray(urls)
    ? urls
        .map((u) => {
          const original = typeof u === 'string' ? u : u?.url;
          if (!original) return '';
          const filename = original.split('/').pop();
          return `http://127.0.0.1:8000/api/car-image/${filename}`;
        })
        .filter(Boolean)
    : [];
};

// Single Car PDF
export const SingleCarDocument = ({ car, logoUrl }) => {
  const urls = extractImageUrls(car);
  const color = normalizeColor(car?.colour);
  const status = (car?.status || '').toLowerCase();

  const getStatusColor = () => {
    switch (status) {
      case 'available': return '#10B981';
      case 'rented': return '#F59E0B';
      case 'maintenance': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image src="http://127.0.0.1:8000/api/car-image/691839f24bf03.jpg" style={styles.logo} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Car Details Report</Text>
            <Text style={styles.subtitle}>Generated on {new Date().toLocaleString()}</Text>
          </View>
        </View>

        {/* Car Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Car Information</Text>

          <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{car?.name || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Source:</Text><Text style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>{car?.source || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Model:</Text><Text style={styles.value}>{car?.model || '-'}</Text></View>
          <View style={styles.row}>
            <Text style={styles.label}>Color:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.swatch, { backgroundColor: color }]} />
              {/* <Text style={styles.value}>{car?.colour || '-'}</Text> */}
            </View>
          </View>
          <View style={styles.row}><Text style={styles.label}>Chassis No:</Text><Text style={styles.value}>{car?.chasis_number || '-'}</Text></View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>{car?.status || '-'}</Text>
          </View>
          <View style={styles.row}><Text style={styles.label}>Rent Type:</Text><Text style={styles.value}>{(car?.rent_period || '').replaceAll('_', ' ')}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Rent Price:</Text><Text style={styles.value}>{car?.rent_price ? `AED ${car.rent_price}` : '-'}</Text></View>
        
        {urls.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Car Images</Text>
            <View style={styles.images}>
              {urls.map((u, idx) => <Image key={idx} src={u} style={styles.thumb} />)}
            </View>
          </View>
        )}
        </View>

        {/* Images */}
        

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

// Cars List PDF
export const CarsListDocument = ({ rows, logoUrl }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {logoUrl && <Image src={logoUrl} style={styles.logo} />}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Cars List</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleString()}</Text>
        </View>
      </View>

      {rows.map((car, idx) => {
        const urls = extractImageUrls(car);
        const color = normalizeColor(car?.colour);
        return (
          <View key={idx} style={styles.card}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>{car?.name || '-'}</Text>

            <View style={styles.row}><Text style={styles.label}>Type:</Text><Text style={styles.value}>{car?.type || 'Car'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Source:</Text><Text style={styles.value}>{car?.source || '-'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Model:</Text><Text style={styles.value}>{car?.model || '-'}</Text></View>
            <View style={styles.row}>
              <Text style={styles.label}>Colour:</Text>
              <View>
                <View style={[styles.swatch]} />
              </View>
            </View>
            <View style={styles.row}><Text style={styles.label}>Chassis No:</Text><Text style={styles.value}>{car?.chasis_number || '-'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Status:</Text><Text style={styles.value}>{car?.status || '-'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Rent Type:</Text><Text style={styles.value}>{(car?.rent_period || '').replaceAll('_', ' ')}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Rent Price:</Text><Text style={styles.value}>{car?.rent_price || '-'}</Text></View>

            {urls.length > 0 && (
              <View style={styles.images}>
                {urls.map((u, idx2) => <Image key={idx2} src={u} style={styles.thumb} />)}
              </View>
            )}
          </View>
        );
      })}

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

export default CarsListDocument;
