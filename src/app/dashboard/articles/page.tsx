'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Hourglass } from '@phosphor-icons/react/dist/ssr/Hourglass';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import axios from 'axios';

interface ArticleRequest {
  _id: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  status: string;
  createdAt: string;
}

const ArticlesRequestsPage = () => {
  const [requests, setRequests] = useState<ArticleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchArticleRequests = async () => {
      try {
        const response = await axios.get('http://81.29.136.136:3001/article/requests');
        setRequests(response.data.requests);
      } catch (error) {
        console.error('Ошибка при получении заявок на статьи:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`http://81.29.136.136:3001/article/requests/approve/${id}`);
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === id ? { ...request, status: 'approved' } : request))
      );
      setSnackbarMessage('Заявка на статью одобрена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при одобрении заявки на статью:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post(`http://81.29.136.136:3001/article/requests/reject/${id}`);
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === id ? { ...request, status: 'rejected' } : request))
      );
      setSnackbarMessage('Заявка на статью отклонена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при отклонении заявки на статью:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const filteredRequests = requests
    .filter((request) => {
      if (filter === 'all') return true;
      return request.status === filter;
    })
    .reverse(); // Переворачиваем массив, чтобы новые элементы были первыми

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Заявки на публикацию статей
      </Typography>

      {/* Кнопки фильтрации */}
      <Box mb={4} mt={4}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
          style={{ marginRight: '10px' }}
        >
          Все
        </Button>
        <Button
          variant={filter === 'pending' ? 'contained' : 'outlined'}
          onClick={() => setFilter('pending')}
          style={{ marginRight: '10px' }}
        >
          Не обработанные
        </Button>
        <Button
          variant={filter === 'approved' ? 'contained' : 'outlined'}
          onClick={() => setFilter('approved')}
          style={{ marginRight: '10px' }}
        >
          Принятые
        </Button>
        <Button
          variant={filter === 'rejected' ? 'contained' : 'outlined'}
          onClick={() => setFilter('rejected')}
          style={{ marginRight: '10px' }}
        >
          Отклоненные
        </Button>
      </Box>

      <Grid container spacing={4}>
        {filteredRequests.map((request) => (
          <Grid item xs={12} md={6} key={request._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {request.title}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {request.description}
                </Typography>

                {/* Предварительный просмотр обложки */}
                {request.coverImage && (
                  <Box mt={2}>
                    <img
                      src={request.coverImage}
                      alt="Обложка статьи"
                      style={{ borderRadius: '8px', width: '100%', height: 'auto' }}
                    />
                  </Box>
                )}
              </CardContent>
              <CardActions style={{ paddingLeft: '8px' }}>
                {request.status === 'pending' && (
                  <>
                    <div
                      style={{
                        paddingBottom: '20px',
                        paddingLeft: '14px',
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => handleApprove(request._id)}
                        style={{
                          marginRight: '10px',
                          backgroundColor: '#1976d2',
                          color: '#ffffff',
                        }}
                      >
                        Принять
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleReject(request._id)}
                        style={{
                          backgroundColor: '#d32f2f',
                          color: '#ffffff',
                        }}
                      >
                        Отклонить
                      </Button>
                    </div>
                    <Box
                      display="flex"
                      alignItems="center"
                      style={{
                        paddingBottom: '20px',
                        paddingLeft: '14px',
                      }}
                    >
                      <Hourglass size={24} weight="fill" color="#ff9800" style={{ marginRight: '8px' }} />
                      <Typography style={{ color: '#ff9800' }}>В ожидании обработки</Typography>
                    </Box>
                  </>
                )}
                {request.status === 'approved' && (
                  <Box
                    display="flex"
                    alignItems="center"
                    style={{
                      paddingBottom: '20px',
                      paddingLeft: '14px',
                    }}
                  >
                    <CheckCircle size={24} weight="fill" color="#388e3c" style={{ marginRight: '8px' }} />
                    <Typography style={{ color: '#388e3c' }}>Одобрено</Typography>
                  </Box>
                )}
                {request.status === 'rejected' && (
                  <Box
                    display="flex"
                    alignItems="center"
                    style={{
                      paddingBottom: '20px',
                      paddingLeft: '14px',
                    }}
                  >
                    <XSquare size={24} weight="fill" color="#d32f2f" style={{ marginRight: '8px' }} />
                    <Typography style={{ color: '#d32f2f' }}>Отклонено</Typography>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} message={snackbarMessage} />
    </Container>
  );
};

export default ArticlesRequestsPage;
