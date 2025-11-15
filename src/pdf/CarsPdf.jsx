import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FAFAFA'
  },
  header: {
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: '#111827',
  },
  stamp: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 4,
    fontSize: 9
  },
  sectionTitle: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 8,
    marginTop: 6
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#6B7280',
    width: '42%',
  },
  value: {
    color: '#111827',
    width: '58%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8
  },
  statusBadge: {
    fontSize: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-end',
    color: '#fff'
  },
  images: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6
  },
  thumb: {
    width: 150,
    height: 100,
    objectFit: 'cover',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6
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
    borderColor: '#9CA3AF'
  },
  url: {
    fontSize: 8,
    color: '#4B5563',
    marginTop: 2,
    wordBreak: 'break-all'
  },
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 28,
    right: 28,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 9
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
  const styles = StyleSheet.create({
    page: {
      padding: 32,
      fontSize: 11,
      fontFamily: 'Helvetica',
      backgroundColor: '#FAFAFA'
    },

    // HEADER
    header: {
      marginBottom: 24,
      textAlign: 'center'
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

    // CARD
    card: {
      padding: 16,
      marginBottom: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB'
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#111827'
    },

    divider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 8
    },

    row: {
      flexDirection: 'row',
      marginBottom: 8
    },

    label: {
      width: '35%',
      fontWeight: 'bold',
      color: '#374151'
    },

    value: {
      color: '#1F2937',
      fontSize: 11
    },

    // COLOR SWATCH
    swatch: {
      width: 50,
      height: 16,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#D1D5DB'
    },

    // STATUS BADGE
    statusBadge: {
      color: '#fff',
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 4,
      fontSize: 10
    },

    // IMAGE GRID
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8
    },
    imageItem: {
      width: 140,
      height: 100,
      marginRight: 8,
      marginBottom: 8,
      borderRadius: 4,
      objectFit: 'cover'
    },

    // FOOTER
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 32,
      right: 32,
      textAlign: 'center',
      fontSize: 10,
      color: '#6B7280'
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Titans Car Detail Report</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleString()}</Text>
        </View>

        {/* SUMMARY CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Car Information</Text>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{car?.name || '-'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Source:</Text>
            <Text style={styles.value}>{car?.source || '-'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Model:</Text>
            <Text style={styles.value}>{car?.model || '-'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Color:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: color || '#FFFFFF' }
                ]}
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Chassis No:</Text>
            <Text style={styles.value}>{car?.chasis_number || '-'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    status === 'available'
                      ? '#10B981'
                      : status === 'rented'
                        ? '#F59E0B'
                        : status.includes('maint')
                          ? '#3B82F6'
                          : '#6B7280'
                }
              ]}
            >
              {car?.status || '-'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Rent Type:</Text>
            <Text style={styles.value}>
              {(car?.rent_period || '').toString().replaceAll('_', ' ')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Rent Price:</Text>
            <Text style={styles.value}>{car?.rent_price ? `AED ${car.rent_price}` : '-'}</Text>
          </View>
        </View>

        {/* IMAGE GRID */}
        {urls.length > 0 && (
          <View style={styles.card}>


            <Text style={styles.sectionTitle}>Car Images</Text>
            <View style={styles.divider} />

            <View style={styles.imageGrid}>
              {console.log('images urls', urls)}
              {urls.map((u, idx) => (
                <Image key={idx} src={u} style={styles.imageItem} />
              ))}
            </View>
          </View>
        )}

        {/* FOOTER */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
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
                {console.log('images urls', urls)}
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
