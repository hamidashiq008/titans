import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import axios from '../../axios/Axios';

// Styles for Cars List Document
const styles = StyleSheet.create({
    page: {
        padding: 30,
        paddingBottom: 70,
        fontSize: 12,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        borderBottomWidth: 2,
        borderBottomColor: '#1F2937',
        paddingBottom: 15,
    },
    logo: {
        width: 80,
        height: 40,
    },
    titleBlock: {
        textAlign: 'right',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 10,
        color: '#6B7280',
    },
    body: {
        marginTop: 20,
    },
    carCard: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 20,
    },
    cardSpacing: {
        marginBottom: 18,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
        paddingBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#374151',
        width: '30%',
    },
    value: {
        fontSize: 11,
        color: '#1F2937',
        width: '68%',
        textAlign: 'left',
    },
    statusBadge: {
        fontSize: 10,
        color: '#fff',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        textAlign: 'center',
    },
    colorSwatch: {
        width: 60,
        height: 20,
        borderWidth: 1,
        borderColor: '#9CA3AF',
        borderRadius: 4,
        marginRight: 10,
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imagesContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    imagesTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 10,
    },
    imagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    imageThumb: {
        width: 80,
        height: 60,
        objectFit: 'cover',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
    },
    noImages: {
        fontSize: 10,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 9,
    },
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        right: 30,
        color: '#9CA3AF',
        fontSize: 9,
    },
    summary: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 6,
    },
    summaryText: {
        fontSize: 10,
        color: '#374151',
        textAlign: 'center',
    },
    carNumber: {
        fontSize: 10,
        color: '#6B7280',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    }
});

// Helper functions
const normalizeColor = (value) => {
    if (!value || typeof value !== 'string') return '#FFFFFF';
    const v = value.trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
    if (v.startsWith('rgb')) {
        const match = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`.toUpperCase();
        }
    }
    return '#FFFFFF';
};

const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
        case 'available': return '#10B981';
        case 'rented': return '#F59E0B';
        case 'maintenance': return '#3B82F6';
        default: return '#6B7280';
    }
};

const extractImageUrls = (car) => {
    const urls = car?.image_urls || car?.images?.[0]?.image_urls || [];
    return Array.isArray(urls)
        ? urls
            .map((u) => {
                const original = typeof u === 'string' ? u : u?.url;
                if (!original) return '';
                const filename = original.split('/').pop();
                return `${axios.defaults.baseURL}/car-image/${filename}`;
                // return `http://127.0.0.1:8000/api/car-image/${filename}`;
            })
            .filter(Boolean)
        : [];
};

// Cars List PDF Document - continuous list
export const CarsListDocument = ({ cars }) => {
    const hasCars = Array.isArray(cars) && cars.length > 0;

    return (
        <>

            <Document>
                <Page size="A4" style={styles.page} wrap>


                    {!hasCars && (
                        <View style={styles.summary}>
                            <Text style={styles.summaryText}>No cars available</Text>
                        </View>
                    )}

                    {hasCars && (
                        <View style={styles.body}>
                            {cars.map((car, index) => {
                                const statusColor = getStatusColor(car.status);
                                const imageUrls = extractImageUrls(car);
                                const hasImages = imageUrls.length > 0;

                                return (
                                    <View
                                        key={car.id || index}
                                        style={[styles.carCard, index !== cars.length - 1 && styles.cardSpacing]}
                                        wrap
                                    >
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.sectionTitle}>Car Information</Text>
                                            <Text style={styles.carNumber}>Car #{index + 1}</Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Text style={styles.label}>Name:</Text>
                                            <Text style={styles.value}>{car.name || '-'}</Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Text style={styles.label}>Source:</Text>
                                            <Text style={styles.value}>{car.source || '-'}</Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Text style={styles.label}>Model:</Text>
                                            <Text style={styles.value}>{car.model || '-'}</Text>
                                        </View>

                                        <View style={styles.infoRow} className="w-25">
                                            <Text style={styles.label}>Color:</Text>
                                            <View style={styles.colorContainer}>
                                                <View style={[styles.colorSwatch, { backgroundColor: normalizeColor(car.colour) }]} />

                                            </View>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Text style={styles.label}>Chassis No:</Text>
                                            <Text style={styles.value}>{car.chasis_number || '-'}</Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Text style={styles.label}>Status:</Text>
                                            <Text style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                                {car.status || '-'}
                                            </Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Text style={styles.label}>Rent Type:</Text>
                                            <Text style={styles.value}>
                                                {(car.rent_period || '').replaceAll('_', ' ')}
                                            </Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Text style={styles.label}>Rent Price:</Text>
                                            <Text style={styles.value}>
                                                {car.rent_price ? `AED ${car.rent_price}` : '-'}
                                            </Text>
                                        </View>

                                        {hasImages && (
                                            <View style={styles.imagesContainer}>
                                                <Text style={styles.imagesTitle}>Car Images</Text>
                                                <View style={styles.imagesGrid}>
                                                    {imageUrls.map((url, idx) => (
                                                        <Image key={idx} src={url} style={styles.imageThumb} />
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </Page>
            </Document>
        </>
    );
};

