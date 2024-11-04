// AllReviewsPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Pagination,
  Typography,
} from '@mui/material';
import { IconHttpDelete } from '@tabler/icons-react';
import axios from 'axios';

interface Review {
  perfume_id: string;
  main_image: string;
  reviews: {
    _id: string; // Теперь поле _id доступно
    body: string;
    createdAt: string;
  };
  user: {
    _id: string;
    username: string;
  };
}

const AllReviewsPage = () => {
  // Функция для получения текущего пользователя
  const getCurrentUser = () => {
    return {
      _id: 'adminUserId',
      isAdmin: true, // Установите в true, если пользователь является администратором
      // token: 'your-auth-token', // Если требуется токен для аутентификации
    };
  };

  const currentUser = getCurrentUser();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const limit = 20;

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://hltback.parfumetrika.ru/perfumes/reviews/all', {
          params: {
            page,
            limit,
          },
        });
        setReviews(response.data.reviews);
        setPages(response.data.pages);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleDelete = async (perfume_id: string, reviewId: string) => {
    const confirmDelete = window.confirm('Вы действительно хотите удалить этот отзыв?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://hltback.parfumetrika.ru/perfumes/delete/${perfume_id}/reviews/${reviewId}`, {
        headers: {
          // Если требуется токен для аутентификации
          // Authorization: `Bearer ${currentUser.token}`,
        },
      });

      // Удаляем отзыв из состояния
      setReviews((prevReviews) => prevReviews.filter((review) => review.reviews._id !== reviewId));

      alert('Отзыв успешно удален.');
    } catch (error) {
      console.error('Ошибка при удалении отзыва:', error);
      alert('Не удалось удалить отзыв.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Все отзывы
      </Typography>
      <Grid container spacing={4}>
        {reviews.map((review) => (
          <Grid item xs={12} md={6} key={review.reviews._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    {review.user?.username ? review.user.username.charAt(0).toUpperCase() : 'A'}
                  </Avatar>
                  <div style={{ flexGrow: 1 }}>
                    <Typography variant="h6">{review.user?.username || 'Аноним'}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(review.reviews.createdAt).toLocaleString()}
                    </Typography>
                  </div>
                  {/* Кнопка удаления для администратора */}
                  {currentUser.isAdmin && (
                    <IconButton aria-label="delete" onClick={() => handleDelete(review.perfume_id, review.reviews._id)}>
                      <IconHttpDelete />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="body1" gutterBottom>
                  {review.reviews.body}
                </Typography>
                {/* Отображение информации о парфюме */}
                <Typography variant="body2" color="textSecondary">
                  ID парфюма: {review.perfume_id}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {pages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={pages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Container>
  );
};

export default AllReviewsPage;
