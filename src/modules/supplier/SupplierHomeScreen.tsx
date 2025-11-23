import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../../styles/supplier/SupplierHomeScreen.styles';
import { linkedSuppliers, orders, complaints } from '../../api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { emitter } from '../../helpers/events';
import { getTranslations, type Language } from '../../translations';
import { LINK_STATUS, ORDER_STATUS, COMPLAINT_STATUS } from '../../constants';

export default function SupplierHomeScreen({ language = 'en', userName = 'TechPro Supply', navigateTo }: { language?: Language; userName?: string; navigateTo?: (screen: string) => void }) {
  const t = getTranslations('supplier', 'home', language);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number | null>(null);
  const [openOrdersCount, setOpenOrdersCount] = useState<number | null>(null);
  const [activeComplaintsCount, setActiveComplaintsCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        let pending = 0;
        if (typeof (linkedSuppliers as any).fetchLinkRequests === 'function') {
          const reqs = await (linkedSuppliers as any).fetchLinkRequests(userName);
          pending = Array.isArray(reqs) ? reqs.filter((r: any) => r.status === LINK_STATUS.PENDING).length : 0;
        } else if (typeof (linkedSuppliers as any).fetchLinkedSuppliers === 'function') {
          // fallback: count linked suppliers entries that look like pending/in-progress
          const linked = await (linkedSuppliers as any).fetchLinkedSuppliers(userName);
          pending = Array.isArray(linked) ? linked.filter((l: any) => String((l.status || '')).toLowerCase() === ORDER_STATUS.IN_PROGRESS_LOWER || String((l.status || '')).toLowerCase() === LINK_STATUS.PENDING).length : 0;
        }
        const ords = await orders.fetchOrdersForConsumer(undefined, userName as any);
        const open = Array.isArray(ords) ? ords.filter((o: any) => o.status !== ORDER_STATUS.COMPLETED && o.status !== ORDER_STATUS.COMPLETED).length : 0;
        const comps = await complaints.fetchComplaintsForSupplier(userName as any);
        const active = Array.isArray(comps) ? comps.length : 0;
        if (mounted) {
          setPendingRequestsCount(pending);
          setOpenOrdersCount(open);
          setActiveComplaintsCount(active);
        }
      } catch (e) {
        if (mounted) { setPendingRequestsCount(0); setOpenOrdersCount(0); setActiveComplaintsCount(0); }
      }
    };
    load();
    const off1 = emitter.on('linkRequestsChanged', load);
    const off2 = emitter.on('ordersChanged', load);
    const off3 = emitter.on('complaintsChanged', load);
    return () => { mounted = false; try { off1(); off2(); off3(); } catch (e) {} };
  }, [userName]);

  const kpis = [
    {
      id: 'link-requests',
      title: t.pendingRequests,
      value: pendingRequestsCount ?? 0,
      unit: t.requests,
      icon: () => <Feather name="link" size={24} color="#2563eb" />,
      color: '#e0e7ff',
      iconBg: '#eff6ff',
      screen: 'link-requests',
    },
    {
      id: 'supplier-orders',
      title: t.openOrders,
      value: openOrdersCount ?? 0,
      unit: t.orders,
      icon: () => <MaterialIcons name="inventory" size={24} color="#22c55e" />,
      color: '#bbf7d0',
      iconBg: '#f0fdf4',
      screen: 'supplier-orders',
    },
    {
      id: 'complaints',
      title: t.complaints,
      value: activeComplaintsCount ?? 0,
      unit: t.issues,
      icon: () => <MaterialIcons name="report-problem" size={24} color="#f59e42" />,
      color: '#fed7aa',
      iconBg: '#fff7ed',
      screen: 'complaints',
    },
  ];

  const bottomTabs = [
    { id: 'supplier-home', label: t.home, icon: () => <Feather name="home" size={22} /> },
    { id: 'link-requests', label: t.pendingRequests, icon: () => <Feather name="link" size={22} /> },
    { id: 'supplier-catalog', label: t.catalog, icon: () => <MaterialIcons name="inventory" size={22} /> },
    { id: 'supplier-orders', label: t.openOrders, icon: () => <Feather name="package" size={22} /> },
    { id: 'supplier-profile', label: t.profile, icon: () => <Feather name="user" size={22} /> },
  ];

  const activeTab = 'supplier-home';

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom", "top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t.welcome}</Text>
          <Text style={styles.headerSubtitle}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={() => navigateTo && navigateTo('supplier-catalog')}>
          <Feather name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Revenue Card (MVP placeholder) */}
        <View style={styles.revenueCard}>
          <View>
            <Text style={styles.revenueLabel}>{t.revenue}</Text>
            <Text style={[styles.revenueValue, { fontSize: 14 }]}>{t.underDevelopment}</Text>
          </View>
          <Feather name="trending-up" size={32} color="#bbf7d0" />
        </View>
        {/* KPIs */}
        {kpis.map((kpi) => (
          <TouchableOpacity
            key={kpi.id}
            style={styles.kpiCard}
            onPress={() => navigateTo && navigateTo(kpi.screen)}
            activeOpacity={0.8}
          >
            <View style={[styles.kpiIconCircle, { backgroundColor: kpi.iconBg }]}>
              {kpi.icon()}
            </View>
            <View style={styles.kpiTextBlock}>
              <Text style={styles.kpiTitle}>{kpi.title}</Text>
              <Text style={styles.kpiDesc}>{kpi.value} {kpi.unit}</Text>
            </View>
            <Text style={styles.kpiViewAll}>{t.viewAll}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.bottomNavItem}
            onPress={() => navigateTo && navigateTo(tab.id)}
          >
            {tab.icon()}
            <Text style={[styles.bottomNavLabel, activeTab === tab.id && { color: '#2563eb' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
