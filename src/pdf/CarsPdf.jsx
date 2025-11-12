import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 11,
    fontFamily: 'Helvetica'
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center'
  },
  stamp: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
    fontSize: 9
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#555',
    width: '40%'
  },
  value: {
    color: '#111',
    width: '60%',
    textAlign: 'right'
  },
  images: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6
  },
  thumb: {
    width: 140,
    height: 90,
    objectFit: 'cover',
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000'
  },
  url: {
    fontSize: 8,
    color: '#333',
    marginTop: 2,
    wordBreak: 'break-all'
  }
});

const normalizeColor = (value) => {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
  const m = v.match(/^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1))?\s*\)$/i);
  if (m) {
    const r = Math.max(0, Math.min(255, parseInt(m[1], 10)));
    const g = Math.max(0, Math.min(255, parseInt(m[2], 10)));
    const b = Math.max(0, Math.min(255, parseInt(m[3], 10)));
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  return v;
};

const extractImageUrls = (car) => {
  const urls = car?.image_urls || (car?.images?.[0]?.image_urls) || [];
  return Array.isArray(urls)
    ? urls.map((u) => (typeof u === 'string' ? u : (u?.url ?? ''))).filter(Boolean)
    : [];
};

export const SingleCarDocument = ({ car }) => {
  const urls = extractImageUrls(car);
  const color = normalizeColor(car?.colour);
  const status = (car?.status || '').toString().toLowerCase();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Car Details</Text>

        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.label}>Name</Text><Text style={styles.value}>{car?.name || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Source</Text><Text style={styles.value}>{car?.source || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Model</Text><Text style={styles.value}>{car?.model || '-'}</Text></View>
          <View style={[styles.row, styles.colorRow]}>
            <Text style={styles.label}>Colour</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.swatch, { backgroundColor: color || '#FFFFFF' }]} />
              <Text style={styles.value}>{car?.colour || '-'}</Text>
            </View>
          </View>
          <View style={styles.row}><Text style={styles.label}>Chassis No</Text><Text style={styles.value}>{car?.chasis_number || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Status</Text><Text style={styles.value}>{car?.status || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Rent Type</Text><Text style={styles.value}>{(car?.rent_period || '').toString().replaceAll('_', ' ')}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Rent Price</Text><Text style={styles.value}>{car?.rent_price || '-'}</Text></View>

          {urls.length > 0 && (
            <View style={styles.images}>
              {urls.map((u, idx) => (
                <Image key={idx} src={u} style={styles.thumb} />
              ))}
            </View>
          )}

          {/* URLs list */}
          {urls.length > 0 && (
            <View style={{ marginTop: 6 }}>
              {urls.map((u, idx) => (
                <Text key={idx} style={styles.url}>{u}</Text>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export const CarsListDocument = ({ rows }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Cars List</Text>
      <Text style={styles.stamp}>Generated: {new Date().toLocaleString()}</Text>
      {rows.map((car, idx) => {
        const urls = extractImageUrls(car);
        const color = normalizeColor(car?.colour);
        return (
          <View key={idx} style={styles.card}>
            <Text style={{ fontSize: 13, marginBottom: 6 }}>{car?.name || '-'}</Text>
            <View style={styles.row}><Text style={styles.label}>Type</Text><Text style={styles.value}>{car?.type || 'Car'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Source</Text><Text style={styles.value}>{car?.source || '-'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Model</Text><Text style={styles.value}>{car?.model || '-'}</Text></View>
            <View style={[styles.row, styles.colorRow]}>
              <Text style={styles.label}>Colour</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.swatch, { backgroundColor: color || '#FFFFFF' }]} />
                <Text style={styles.value}>{car?.colour || '-'}</Text>
              </View>
            </View>
            <View style={styles.row}><Text style={styles.label}>Chassis No</Text><Text style={styles.value}>{car?.chasis_number || '-'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Status</Text><Text style={styles.value}>{car?.status || '-'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Rent Type</Text><Text style={styles.value}>{(car?.rent_period || '').toString().replaceAll('_', ' ')}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Rent Price</Text><Text style={styles.value}>{car?.rent_price || '-'}</Text></View>

            {urls.length > 0 && (
              <View style={styles.images}>
                {urls.map((u, idx2) => (
                  <Image key={idx2} src={u} style={styles.thumb} />
                ))}
              </View>
            )}

            {urls.length > 0 && (
              <View style={{ marginTop: 6 }}>
                {urls.map((u, idx3) => (
                  <Text key={idx3} style={styles.url}>{u}</Text>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </Page>
  </Document>
);

export default CarsListDocument;
