'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';

export default function Page(): React.JSX.Element {
  const [userStats, setUserStats] = React.useState<{ month: string; count: number }[]>([]);
  const [totalUsers, setTotalUsers] = React.useState<string>('');
  const [latestArticles, setLatestArticles] = React.useState<any[]>([]);
  const [recentReviews, setRecentReviews] = React.useState<any[]>([]); // Состояние для последних отзывов

  // Загружаем данные пользователей по месяцам
  React.useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch('https://hltback.parfumetrika.ru/users/users-by-month');
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.statusText}`);
        }
        const data = await response.json();
        setUserStats(data.usersByMonth || []);
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователей:', error);
      }
    };

    fetchUserStats();
  }, []);

  // Загружаем общее количество пользователей
  React.useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await fetch('https://hltback.parfumetrika.ru/users/total-users');
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.statusText}`);
        }
        const data = await response.json();
        const formattedTotal =
          data.totalUsers >= 1000 ? `${(data.totalUsers / 1000).toFixed(1)}k` : `${data.totalUsers}`;
        setTotalUsers(formattedTotal);
      } catch (error) {
        console.error('Ошибка при загрузке общего количества пользователей:', error);
      }
    };

    fetchTotalUsers();
  }, []);

  // Загружаем последние статьи
  React.useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const response = await fetch('https://hltback.parfumetrika.ru/article/latest');
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.statusText}`);
        }
        const data = await response.json();

        const articles = data.map((article: any) => ({
          id: article._id,
          name: article.title,
          description: article.description,
          image: '/assets/default-product.png',
          updatedAt: dayjs().toDate(),
        }));

        setLatestArticles(articles);
      } catch (error) {
        console.error('Ошибка при загрузке последних статей:', error);
      }
    };

    fetchLatestArticles();
  }, []);

  // Загружаем последние отзывы
  React.useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const response = await fetch('https://hltback.parfumetrika.ru/perfumes/reviews/recent');
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.statusText}`);
        }
        const data = await response.json();

        // Преобразуем данные для компонента LatestOrders
        const reviews = data.map((item: any) => ({
          id: item.perfume_id,
          customer: { name: item.user?.username || 'Unknown' },
          review: item.reviews?.body || 'No review content',
          createdAt: item.reviews?.createdAt ? dayjs(item.reviews.createdAt).toDate() : dayjs().toDate(),
        }));

        setRecentReviews(reviews);
      } catch (error) {
        console.error('Ошибка при загрузке последних отзывов:', error);
      }
    };

    fetchRecentReviews();
  }, []);

  // Создаем массив с названиями месяцев и количеством пользователей
  const chartSeries = [
    {
      name: 'Пользователи за месяц',
      data: userStats.map((stat) => stat.count),
    },
  ];
  const months = userStats.map((stat) => stat.month);

  return (
    <Grid container spacing={3}>
      {/* Отображение общего количества пользователей */}
      <Grid lg={5} sm={6} xs={12}>
        <TotalCustomers diff={16} trend="down" sx={{ height: '100%' }} value={totalUsers} />
      </Grid>

      <Grid lg={10} xs={12}>
        <Sales chartSeries={chartSeries} months={months} sx={{ height: '100%' }} />
      </Grid>

      <Grid lg={5} md={6} xs={12}>
        <LatestProducts products={latestArticles} sx={{ height: '100%' }} />
      </Grid>

      <Grid lg={6} md={12} xs={12}>
        {/* Отображение последних отзывов в LatestOrders */}
        <LatestOrders orders={recentReviews} sx={{ height: '100%' }} />
      </Grid>
    </Grid>
  );
}
