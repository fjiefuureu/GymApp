import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';

export default function MainScreen() {
    const [isLoading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState([]);
    const [newExercise, setNewExercise] = useState('');
    const [weight, setWeight] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [category, setCategory] = useState('Klatka');

    const categories = ['Klatka', 'Plecy', 'Nogi', 'Barki', 'Ramiona'];
    const API_URL = "http://localhost:3000/exercises";

    const loadData = () => {
        fetch(API_URL, { headers: { "Bypass-Tunnel-Reminder": "true" } })
            .then((response) => response.json())
            .then((json) => setData(json))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    };

    const finishWorkout = () => {
        fetch(`${API_URL}/finish`, {
            method: 'POST',
            headers: { "Bypass-Tunnel-Reminder": "true" }
        })
            .then(response => {
                if (response.ok) {
                    alert("Trening zakoñczony!");
                    loadData();
                }
            })
            .catch(error => console.error(error));
    };

    useEffect(() => { loadData(); }, []);

    const estimated1RM = () => {
        const w = parseFloat(weight);
        const r = parseInt(reps);
        if (w > 0 && r > 0 && r < 37) return (w * (36 / (37 - r))).toFixed(1);
        return null;
    };

    const saveExercise = () => {
        if (newExercise.length === 0) return;
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API_URL}/${editingId}` : API_URL;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newExercise, sets, reps, weight, category })
        })
            .then((response) => {
                if (response.ok) {
                    setNewExercise(''); setSets(''); setReps(''); setWeight('');
                    setEditingId(null); loadData();
                }
            });
    };

    const editExercise = (item) => {
        setEditingId(item.id);
        setNewExercise(item.name);
        setWeight(item.weight ? item.weight.toString() : '');
        setSets(item.sets ? item.sets.toString() : '');
        setReps(item.reps ? item.reps.toString() : '');
    };

    const deleteExercise = (id) => {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(() => loadData());
    };

    return (
        <View style={styles.container}>
            {/* 1. Wybór kategorii */}
            <View style={styles.categoryBar}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[styles.catBtn, category === cat && styles.catBtnActive]}
                    >
                        <Text style={{ color: category === cat ? 'black' : 'white', fontSize: 10 }}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 2. Pola wpisywania */}
            <View style={styles.inputArea}>
                <TextInput style={[styles.input, { flex: 2 }]} placeholder="Æwiczenie" value={newExercise} onChangeText={setNewExercise} placeholderTextColor="#777" />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="kg" keyboardType="numeric" value={weight} onChangeText={setWeight} />
                <TextInput style={[styles.input, { flex: 0.8 }]} placeholder="Seria" keyboardType="numeric" value={sets} onChangeText={setSets} />
                <TextInput style={[styles.input, { flex: 0.8 }]} placeholder="Powtorzenia" keyboardType="numeric" value={reps} onChangeText={setReps} />
                <TouchableOpacity style={styles.addButton} onPress={saveExercise}>
                    <Ionicons name="add" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* 3. Wyliczony rekord */}
            {estimated1RM() > 0 && (
                <Text style={{ color: '#00FF41', fontSize: 12, marginBottom: 10 }}>
                    Szacowany Max (1RM): {estimated1RM()} kg
                </Text>
            )}

            {/* 4. LISTA ÆWICZEÑ */}
            <FlatList
                style={{ width: '100%' }}
                contentContainerStyle={{ paddingBottom: 20 }}
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => editExercise(item)}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{item.name}</Text>
                            <Text style={{ color: '#888' }}>{item.weight}kg | {item.sets}s x {item.reps}p</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteExercise(item.id)}>
                            <Ionicons name="trash" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* 5. PRZYCISK ZAKOÑCZ */}
            {data.length > 0 && (
                <TouchableOpacity
                    style={styles.finishButton}
                    onPress={finishWorkout}
                >
                    <Text style={styles.finishButtonText}>ZAKOÑCZ TRENING</Text>
                </TouchableOpacity>
            )}
        </View>
    );
} // <--- TUTAJ BRAKOWA£O TEJ KLAMRY!

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', paddingTop: 20, alignItems: 'center' },
    categoryBar: { flexDirection: 'row', marginBottom: 10 },
    catBtn: { padding: 8, backgroundColor: '#333', marginRight: 5, borderRadius: 5 },
    catBtnActive: { backgroundColor: '#00FF41' },
    inputArea: { flexDirection: 'row', width: '95%', gap: 5, marginBottom: 10 },
    input: { backgroundColor: '#1E1E1E', color: 'white', padding: 10, borderRadius: 8 },
    addButton: { backgroundColor: '#00FF41', padding: 10, borderRadius: 8, justifyContent: 'center' },
    item: { flexDirection: 'row', padding: 15, backgroundColor: '#1E1E1E', borderRadius: 10, width: '95%', marginVertical: 5, alignItems: 'center' },
    finishButton: {
        backgroundColor: '#00FF41',
        padding: 18,
        width: '90%',
        borderRadius: 12,
        marginVertical: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    finishButtonText: {
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
});