import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MainScreen from './screens/MainScreen';
import HistoryScreen from './screens/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Trening') {
                            iconName = focused ? 'barbell' : 'barbell-outline';
                        } else if (route.name === 'Historia') {
                            iconName = focused ? 'calendar' : 'calendar-outline';
                        }
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#00FF41', 
                    tabBarInactiveTintColor: 'gray',
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#00FF41',
                    headerTitleAlign: 'center',
                })}
            >
                <Tab.Screen name="Trening" component={MainScreen} />
                <Tab.Screen name="Historia" component={HistoryScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}