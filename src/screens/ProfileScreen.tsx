// src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase,    // ✅ Job
    Phone,        // ✅ Phone
    MapPin,       // ✅ Location
    Bell,         // ✅ Notifications
    Shield,       // ✅ Privacy
    HelpCircle,   // ✅ Help
    ChevronRight, // ✅ Arrow
    LogOut        // ✅ Logout
} from 'react-native-feather';

const ProfileScreen = () => {
    const { user, photoUrl, logout } = useAuth();

    const handleLogout = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: logout
                }
            ]
        );
    };

    if (!user) return null;

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                {photoUrl && (
                    <Image source={{ uri: photoUrl }} style={styles.profilePhoto} />
                )}
                <Text style={styles.name}>{user.displayName || user.givenName}</Text>
                <Text style={styles.email}>{user.mail || user.userPrincipalName}</Text>
            </View>

            {/* User Info Cards */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Briefcase width={20} height={20} color="#6b7280" strokeWidth={2} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Job Title</Text>
                        <Text style={styles.infoValue}>{user.jobTitle || 'Not specified'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Phone width={20} height={20} color="#6b7280" strokeWidth={2} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{user.mobilePhone || 'Not specified'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <MapPin width={20} height={20} color="#6b7280" strokeWidth={2} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Office</Text>
                        <Text style={styles.infoValue}>{user.officeLocation || 'Not specified'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />
            </View>

            {/* Settings */}
            <View style={styles.settingsCard}>
                <Text style={styles.sectionTitle}>Settings</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <Bell width={22} height={22} color="#0078D4" strokeWidth={2} />
                    <Text style={styles.settingText}>Notifications</Text>
                    <ChevronRight width={20} height={20} color="#d1d5db" strokeWidth={2} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Shield width={22} height={22} color="#0078D4" strokeWidth={2} />
                    <Text style={styles.settingText}>Privacy</Text>
                    <ChevronRight width={20} height={20} color="#d1d5db" strokeWidth={2} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <HelpCircle width={22} height={22} color="#0078D4" strokeWidth={2} />
                    <Text style={styles.settingText}>Help & Support</Text>
                    <ChevronRight width={20} height={20} color="#d1d5db" strokeWidth={2} />
                </TouchableOpacity>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut width={22} height={22} color="white" strokeWidth={2.5} />
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
        borderWidth: 4,
        borderColor: '#e0e7ff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#6b7280',
    },
    infoCard: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginTop: 12,
    },
    settingsCard: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#ef4444',
        margin: 20,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;
