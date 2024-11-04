// AllCommentsPage.tsx
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

interface Comment {
  news_id: string;
  comments: {
    _id: string;
    body: string;
    createdAt: string;
  };
  user: {
    _id: string;
    username: string;
  };
}

const AllCommentsPage = () => {
  const getCurrentUser = () => {
    return {
      _id: 'adminUserId',
      isAdmin: true,
    };
  };

  const currentUser = getCurrentUser();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const limit = 20;

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://hltback.parfumetrika.ru/article/comments/all', {
          params: {
            page,
            limit,
          },
        });
        setComments(response.data.comments);
        setPages(response.data.pages);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleDelete = async (news_id: string, commentId: string) => {
    const confirmDelete = window.confirm('Вы действительно хотите удалить этот комментарий?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://hltback.parfumetrika.ru/article/comments/${commentId}`, {
        headers: {
          // Если требуется токен для аутентификации
          // Authorization: `Bearer ${currentUser.token}`,
        },
      });

      // Удаляем комментарий из состояния
      setComments((prevComments) => prevComments.filter((comment) => comment.comments._id !== commentId));

      alert('Комментарий успешно удален.');
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error);
      alert('Не удалось удалить комментарий.');
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
        Все комментарии
      </Typography>
      <Grid container spacing={4}>
        {comments.map((comment) => (
          <Grid item xs={12} md={6} key={comment.comments._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    {comment.user?.username ? comment.user.username.charAt(0).toUpperCase() : 'A'}
                  </Avatar>
                  <div style={{ flexGrow: 1 }}>
                    <Typography variant="h6">{comment.user?.username || 'Аноним'}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(comment.comments.createdAt).toLocaleString()}
                    </Typography>
                  </div>
                  {/* Кнопка удаления для администратора */}
                  {currentUser.isAdmin && (
                    <IconButton aria-label="delete" onClick={() => handleDelete(comment.news_id, comment.comments._id)}>
                      <IconHttpDelete />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="body1" gutterBottom>
                  {comment.comments.content}
                </Typography>
                {/* Отображение информации о новости */}
                <Typography variant="body2" color="textSecondary">
                  ID новости: {comment.news_id}
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

export default AllCommentsPage;
