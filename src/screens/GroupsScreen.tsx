// src/screens/GroupsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserGroups, getGroupMembers } from '../services/user.service';
import { Users, User, ChevronRight, Mail } from 'react-native-feather';

interface Group {
    id: string;
    displayName: string;
    description?: string;
    mailEnabled: boolean;
    owners?: Array<{ id: string; displayName: string }>;
}

interface Member {
    id: string;
    displayName: string;
    userPrincipalName: string;
    jobTitle?: string;
}

const GroupsScreen = () => {
    const { accessToken } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [groupLoading, setGroupLoading] = useState(false);

    useEffect(() => {
        if (accessToken) {
            fetchGroups();
        }
    }, [accessToken]);

    const fetchGroups = async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const userGroups = await getUserGroups(accessToken);
            setGroups(userGroups);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupMembers = async (group: Group) => {
        if (!accessToken) return;
        try {
            setGroupLoading(true);
            setSelectedGroup(group);
            const groupMembers = await getGroupMembers(accessToken, group.id);
            setMembers(groupMembers);
        } catch (error) {
            console.error('Error fetching group members:', error);
        } finally {
            setGroupLoading(false);
        }
    };

    const renderGroupItem = ({ item }: { item: Group }) => (
        <TouchableOpacity
            style={styles.groupCard}
            onPress={() => fetchGroupMembers(item)}
        >
            <View style={styles.groupHeader}>
                <Users width={24} height={24} color="#0078D4" strokeWidth={2.5} />
                <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{item.displayName}</Text>
                    {item.description && (
                        <Text style={styles.groupDesc} numberOfLines={1}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <ChevronRight width={20} height={20} color="#d1d5db" strokeWidth={2} />
            </View>

            {item.owners && item.owners.length > 0 && (
                <View style={styles.ownerRow}>
                    <User width={16} height={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.ownerText}>
                        Owner: {item.owners[0]?.displayName}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderMemberItem = ({ item }: { item: Member }) => (
        <View style={styles.memberCard}>
            <User width={40} height={40} color="#0078D4" strokeWidth={2} />
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.displayName}</Text>
                <Text style={styles.memberEmail}>{item.userPrincipalName}</Text>
                {item.jobTitle && (
                    <Text style={styles.memberJob}>{item.jobTitle}</Text>
                )}
            </View>
        </View>
    );
    const renderItem = ({ item }: { item: any }) => {
        if (item.type === 'header') {
            return (
                <Text style={styles.sectionTitle}>
                    Your Groups ({groups.length})
                </Text>
            );
        }
        if (item.type === 'group') {
            return renderGroupItem({ item: item.data });
        }
        if (item.type === 'divider') {
            return <View style={styles.divider} />;
        }
        if (item.type === 'membersHeader') {
            return (
                <Text style={styles.sectionTitle}>
                    Members ({selectedGroup?.displayName})
                </Text>
            );
        }
        if (item.type === 'member') {
            return renderMemberItem({ item: item.data });
        }
        return null;
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0078D4" />
                <Text style={styles.loadingText}>Loading your groups...</Text>
            </View>
        );
    }
    const data = [
        { type: 'header', key: 'header' },
        ...groups.map(group => ({ type: 'group', data: group, key: group.id })),
        ...(selectedGroup ? [
            { type: 'divider', key: 'divider' },
            { type: 'membersHeader', key: 'membersHeader' },
            ...(groupLoading ? [] : members.map(member => ({ type: 'member', data: member, key: member.id })))
        ] : [])
    ];
    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }} // ✅ Space for BottomNav
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false} // ✅ Prevents touch blocking
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginLeft: 20,
        marginTop: 20,
        marginBottom: 12,
    },
    groupsList: {
        marginHorizontal: 20,
    },
    groupCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    groupDesc: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    ownerText: {
        fontSize: 13,
        color: '#6b7280',
    },
    divider: {
        height: 12,
        backgroundColor: '#f8fafc',
    },
    membersList: {
        marginHorizontal: 20,
    },
    memberCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
    },
    memberInfo: {
        flex: 1,
        marginLeft: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    memberEmail: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    memberJob: {
        fontSize: 13,
        color: '#0078D4',
        fontWeight: '500',
        marginTop: 2,
    },
});

export default GroupsScreen;
