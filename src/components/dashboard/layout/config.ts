import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  { key: 'perfumes', title: 'Perfumes', href: paths.dashboard.perfumes, icon: 'perfume' },
  { key: 'notes', title: 'Notes', href: paths.dashboard.notes, icon: 'perfume' },
  { key: 'parfumers', title: 'Parfumers', href: paths.dashboard.parfumers, icon: 'perfume' },
  { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },

] satisfies NavItemConfig[];
