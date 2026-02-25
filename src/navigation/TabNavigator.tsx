import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  User,
} from 'lucide-react-native';
import { colors, typography, fontFamily } from '../theme';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { LogScreen } from '../screens/LogScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type TabParamList = {
  Dashboard: undefined;
  Plan: undefined;
  Log: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const iconSize = 22;

function TabIcon({
  Icon,
  focused,
}: {
  Icon: typeof LayoutDashboard;
  focused: boolean;
}) {
  return (
    <Icon
      size={iconSize}
      color={focused ? colors.accent : colors.textMuted}
      strokeWidth={focused ? 2.5 : 2}
    />
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: fontFamily.semibold, fontSize: typography.h3.fontSize, color: colors.text },
        headerShadowVisible: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Today',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon Icon={LayoutDashboard} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          title: 'Plan',
          tabBarLabel: 'Plan',
          tabBarIcon: ({ focused }) => <TabIcon Icon={CalendarDays} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{
          title: 'Log',
          tabBarLabel: 'Log',
          tabBarIcon: ({ focused }) => <TabIcon Icon={ClipboardList} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    minHeight: 64,
  },
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: typography.caption.fontSize,
    letterSpacing: 0.2,
  },
});
