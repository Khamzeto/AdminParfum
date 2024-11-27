// components/GalleryRequestsPage.tsx
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
  ImageListItem,
  Snackbar,
  Typography,
} from '@mui/material';
import { CheckCircle, Hourglass, Trash, XSquare } from '@phosphor-icons/react';
import axios from 'axios';

interface GalleryRequest {
  _id: string;
  perfumeId: Perfume;
  image: string; // Добавлено поле для изображения
  status: string;
  createdAt: string;
}

interface Perfume {
  name: string;
  brand: string;
  [key: string]: any;
}

const GalleryRequestsPage = () => {
  const [requests, setRequests] = useState<GalleryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchGalleryRequests = async () => {
      try {
        const response = await axios.get('https://hltback.parfumetrika.ru/main-image/requests');
        setRequests(response.data.requests);
      } catch (error) {
        console.error('Ошибка при получении заявок на фото:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`https://hltback.parfumetrika.ru/main-image/requests/approve/${id}`);
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === id ? { ...request, status: 'approved' } : request))
      );
      setSnackbarMessage('Заявка на фото одобрена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при одобрении заявки на фото:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post(`https://hltback.parfumetrika.ru/main-image/requests/reject/${id}`);
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === id ? { ...request, status: 'rejected' } : request))
      );
      setSnackbarMessage('Заявка на фото отклонена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при отклонении заявки на фото:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://hltback.parfumetrika.ru/main-image/requests/${id}`);
      setRequests((prevRequests) => prevRequests.filter((request) => request._id !== id));
      setSnackbarMessage('Заявка на фото удалена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при удалении заявки на фото:', error);
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
    .reverse();

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Заявки на добавление фото в галерею
      </Typography>

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
                  Заявка на добавление фото для парфюма: {request.perfumeId.name} ({request.perfumeId.brand})
                </Typography>
                <div style={{ marginTop: '30px' }}>
                  <ImageListItem style={{ borderRadius: '14px' }}>
                    <img src={request.image} alt="Загруженное изображение" />
                  </ImageListItem>
                </div>
              </CardContent>
              <CardActions style={{ paddingLeft: '8px' }}>
                {request.status === 'pending' && (
                  <>
                    <Button
                      variant="contained"
                      onClick={() => handleApprove(request._id)}
                      style={{ marginRight: '10px', backgroundColor: '#1976d2', color: '#ffffff' }}
                    >
                      Принять
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleReject(request._id)}
                      style={{ backgroundColor: '#d32f2f', color: '#ffffff', marginRight: '10px' }}
                    >
                      Отклонить
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Trash size={24} />}
                  onClick={() => handleDelete(request._id)}
                >
                  Удалить
                </Button>
                <div style={{ paddingLeft: '14px', alignItems: 'center', display: 'flex' }}>
                  {request.status === 'approved' && (
                    <CheckCircle size={24} weight="fill" color="#388e3c" style={{ marginRight: '8px' }} />
                  )}
                  {request.status === 'pending' && (
                    <Hourglass size={24} weight="fill" color="#ff9800" style={{ marginRight: '8px' }} />
                  )}
                  {request.status === 'rejected' && (
                    <XSquare size={24} weight="fill" color="#d32f2f" style={{ marginRight: '8px' }} />
                  )}
                  <Typography
                    style={{
                      display: 'flex',
                      color:
                        request.status === 'approved'
                          ? '#388e3c'
                          : request.status === 'pending'
                            ? '#ff9800'
                            : '#d32f2f',
                    }}
                  >
                    {request.status === 'approved'
                      ? 'Одобрено'
                      : request.status === 'pending'
                        ? 'В ожидании обработки'
                        : 'Отклонено'}
                  </Typography>
                </div>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} message={snackbarMessage} />
    </Container>
  );
};

export default GalleryRequestsPage;
