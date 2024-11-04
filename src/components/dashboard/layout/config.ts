import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'dashboard', title: 'Главная', href: paths.dashboard.overview },
  { key: 'customers', title: 'Пользователи', href: paths.dashboard.customers },
  { key: 'perfumes', title: 'Парфюмы', href: paths.dashboard.perfumes },
  { key: 'brands', title: 'Бренды', href: paths.dashboard.brands },
  { key: 'notes', title: 'Ноты', href: paths.dashboard.notes },
  { key: 'parfumers', title: 'Парфюмеры', href: paths.dashboard.parfumers },
  { key: 'requests', title: 'Запросы', href: paths.dashboard.requests },
  { key: 'gallery', title: 'Галерея', href: paths.dashboard.gallery },
  { key: 'posts', title: 'Посты', href: paths.dashboard.posts },
  { key: 'news', title: 'Новости', href: paths.dashboard.news },
  { key: 'comments', title: 'Отзывы', href: paths.dashboard.comments },
  { key: 'newscomments', title: 'Комментарии Новостей', href: paths.dashboard.newscomments },
  { key: 'articlecomments', title: 'Комментарии Статей', href: paths.dashboard.articlecomments },
] satisfies NavItemConfig[];
