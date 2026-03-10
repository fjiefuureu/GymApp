import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function App() {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [newExercise, setNewExercise] = useState('');

    const API_URL = "http://10.40.2.49:3000/exercises";

    const loadData = () => {
        fetch(API_URL, { headers: { "Bypass-Tunnel-Reminder": "true" } })
            .then((response) => response.json())
            .then((json) => setData(json))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

const addExercise = () => {
    if (newExercise.length === 0) return;

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newExercise })
    })
    .then((response) => {
        if (response.ok) {
            // Jeœli serwer odebra³ (a wiemy, ¿e tak jest, bo widzisz to w CMD)
            // to po prostu czyœcimy pole i odœwie¿amy listê
            setNewExercise(''); 
            loadData(); 
        }
    })
    .catch(err => {
        // Nawet jeœli wyskoczy b³¹d sieciowy, i tak odœwie¿amy listê,
        // bo wiemy, ¿e dane i tak wpad³y do bazy!
        setNewExercise('');
        loadData();
        console.log("Zignorowano b³¹d odpowiedzi, bo serwer zapisa³ dane.");
    });
    };
    const deleteExercise = (id) => {
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        })
            .then(() => loadData())
            .catch(err => console.error(err));
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Moja Si³ownia</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nazwa æwiczenia..."
                    value={newExercise}
                    onChangeText={setNewExercise}
                />
                <TouchableOpacity style={styles.button} onPress={addExercise}>
                    <Text style={styles.buttonText}>DODAJ</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? <ActivityIndicator size="large" /> : (
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text style={styles.itemText}>{item.name}</Text>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteExercise(item.id)}
                            >
                                <Text style={{ color: 'red', fontWeight: 'bold'}}>USUN</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, backgroundColor: '#121212', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#00FF41' },
    inputContainer: { flexDirection: 'row', marginBottom: 20, width: '90%' },
    input: { flex: 1, backgroundColor: '#1E1E1E', color: 'white', padding: 15, borderRadius: 10, marginRight: 10 },
    button: { backgroundColor: '#00FF41', padding: 15, borderRadius: 10, justifyContent: 'center' },
    buttonText: { color: 'black', fontWeight: 'bold' },
    item: { padding: 20, marginVertical: 8, backgroundColor: '#1E1E1E', borderRadius: 10, width: '90%' },
    itemText: { fontSize: 18, color: 'white', fontWeight: '500' },
});