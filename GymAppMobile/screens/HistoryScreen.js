import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
    const [isLoading, setLoading] = useState(true);
    const [sections, setSections] = useState([]);
    const [expandedSections, setExpandedSections] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const API_URL = "http://localhost:3000/exercises/history";

    const loadHistory = () => {
        setLoading(true);
        fetch(API_URL, { headers: { "Bypass-Tunnel-Reminder": "true" } })
            .then(res => res.json())
            .then(json => {
                // 1. Grupowanie po dacie
                const dateGroups = json.reduce((acc, ex) => {
                    const date = new Date(ex.created_at).toLocaleDateString('pl-PL');
                    if (!acc[date]) acc[date] = {};

                    // 2. Wewn¹trz daty grupujemy po kategorii
                    const cat = ex.category || 'Inne';
                    if (!acc[date][cat]) acc[date][cat] = [];
                    acc[date][cat].push(ex);

                    return acc;
                }, {});

                // 3. Zamiana na format SectionList
                const sectionArray = Object.keys(dateGroups).map(date => ({
                    title: date,
                    data: [dateGroups[date]] // Wrzucamy obiekt kategorii jako jeden element danych
                }));

                setSections(sectionArray);
            })
            .catch(err => console.error(err))
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => { loadHistory(); }, []);

    const toggleSection = (title) => {
        setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <View style={styles.container}>
            {isLoading ? <ActivityIndicator size="large" color="#00FF41" /> : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => index.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadHistory} tintColor="#00FF41" />}
                    renderSectionHeader={({ section: { title } }) => (
                        <TouchableOpacity
                            style={styles.dateHeader}
                            onPress={() => toggleSection(title)}
                        >
                            <Text style={styles.dateText}>{title}</Text>
                            <Ionicons
                                name={expandedSections[title] ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#00FF41"
                            />
                        </TouchableOpacity>
                    )}
                    renderItem={({ item, section }) => {
                        if (!expandedSections[section.title]) return null;

                        // 'item' tutaj to obiekt kategorii: { "Klatka": [...], "Plecy": [...] }
                        return (
                            <View style={styles.sessionContainer}>
                                {Object.keys(item).map(categoryName => (
                                    <View key={categoryName} style={styles.categoryBlock}>
                                        <Text style={styles.categoryTitle}>{categoryName}</Text>
                                        {item[categoryName].map((ex, idx) => (
                                            <View key={idx} style={styles.exerciseRow}>
                                                <Text style={styles.exerciseName}>{ex.name}</Text>
                                                <Text style={styles.exerciseDetails}>
                                                    {ex.weight}kg | {ex.sets}s x {ex.reps}p
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 10 },
    dateHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#1E1E1E', padding: 15, marginTop: 15, borderRadius: 8,
        borderLeftWidth: 4, borderLeftColor: '#00FF41'
    },
    dateText: { color: '#00FF41', fontWeight: 'bold', fontSize: 16 },
    sessionContainer: { backgroundColor: '#181818', padding: 10, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
    categoryBlock: { marginBottom: 15 },
    categoryTitle: {
        color: '#00FF41', fontSize: 12, fontWeight: 'bold',
        textTransform: 'uppercase', marginBottom: 5, opacity: 0.7
    },
    exerciseRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#252525'
    },
    exerciseName: { color: 'white', fontSize: 15 },
    exerciseDetails: { color: '#888', fontSize: 14 }
});