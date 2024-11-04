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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft, CheckCircle, Hourglass, Star, Trash, XSquare } from '@phosphor-icons/react';
import axios from 'axios';

interface ArticleRequest {
  _id: string;
  title: string;
  description: string;
  content: string;
  coverImage?: string;
  status: string;
  popularityScore?: number;
  userId: { _id: string; username: string };
  createdAt: string;
}

const ArticlesRequestsPage = () => {
  const [requests, setRequests] = useState<ArticleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [fullScreenContentId, setFullScreenContentId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [popularityScore, setPopularityScore] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleRequests = async () => {
      try {
        const response = await axios.get('https://hltback.parfumetrika.ru/article/requests');
        setRequests(response.data.requests);
      } catch (error) {
        console.error('Ошибка при получении заявок на статьи:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleRequests();
  }, []);

  const handleOpenModal = (id: string) => {
    setSelectedArticleId(id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setPopularityScore('');
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.put(`https://hltback.parfumetrika.ru/article/requests/approve/${id}`);
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
      await axios.put(`https://hltback.parfumetrika.ru/article/requests/reject/${id}`);
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === id ? { ...request, status: 'rejected' } : request))
      );
      setSnackbarMessage('Заявка на статью отклонена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при отклонении заявки на статью:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://hltback.parfumetrika.ru/article/delete/${id}`);
      setRequests((prevRequests) => prevRequests.filter((request) => request._id !== id));
      setSnackbarMessage('Статья успешно удалена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при удалении статьи:', error);
    }
  };

  const handleMakePopular = async () => {
    if (!selectedArticleId || !popularityScore.trim()) return;
    try {
      await axios.post(`https://hltback.parfumetrika.ru/article/requests/${selectedArticleId}/popular`, {
        score: Number(popularityScore),
      });
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === selectedArticleId ? { ...request, popularityScore: Number(popularityScore) } : request
        )
      );
      setSnackbarMessage('Статья отмечена как популярная');
      setSnackbarOpen(true);
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка при отметке статьи как популярной:', error);
    }
  };

  const handleUpdatePopularity = async () => {
    if (!selectedArticleId || !popularityScore.trim()) return;
    try {
      await axios.put(`https://hltback.parfumetrika.ru/article/requests/${selectedArticleId}/popular`, {
        score: Number(popularityScore),
      });
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === selectedArticleId ? { ...request, popularityScore: Number(popularityScore) } : request
        )
      );
      setSnackbarMessage('Балл популярности обновлен');
      setSnackbarOpen(true);
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка при обновлении балла популярности:', error);
    }
  };

  const handleRemovePopularity = async (id: string) => {
    try {
      await axios.put(`https://hltback.parfumetrika.ru/article/requests/${id}/unpopular`);
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === id ? { ...request, popularityScore: undefined } : request))
      );
      setSnackbarMessage('Популярность статьи убрана');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при удалении популярности статьи:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleViewContent = (id: string) => {
    setFullScreenContentId(id);
  };

  const handleBackToList = () => {
    setFullScreenContentId(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (fullScreenContentId) {
    const fullScreenArticle = requests.find((request) => request._id === fullScreenContentId);

    return (
      <Container>
        <Button variant="outlined" onClick={handleBackToList} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={20} style={{ marginRight: '10px' }} />
          Назад
        </Button>

        <Typography variant="h4" gutterBottom>
          {fullScreenArticle?.title}
        </Typography>

        {fullScreenArticle?.coverImage && (
          <Box mb={2}>
            <img
              src={fullScreenArticle.coverImage}
              alt="Обложка статьи"
              style={{ borderRadius: '8px', width: '100%', height: 'auto' }}
            />
          </Box>
        )}

        <Typography variant="body1" dangerouslySetInnerHTML={{ __html: fullScreenArticle?.content || '' }} />

        <Box mt={4}>
          {fullScreenArticle?.status === 'pending' && (
            <Box display="flex" gap="8px">
              <Button
                variant="contained"
                onClick={() => handleApprove(fullScreenArticle._id)}
                style={{
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                }}
              >
                Принять
              </Button>
              <Button
                variant="contained"
                onClick={() => handleReject(fullScreenArticle._id)}
                style={{
                  backgroundColor: '#d32f2f',
                  color: '#ffffff',
                }}
              >
                Отклонить
              </Button>
            </Box>
          )}
          <Button
            variant="contained"
            onClick={() => handleOpenModal(fullScreenArticle._id)}
            style={{
              backgroundColor: '#ffb74d',
              color: '#ffffff',
              marginTop: '10px',
            }}
          >
            Сделать популярной
          </Button>
          <Button
            variant="contained"
            onClick={() => handleDelete(fullScreenArticle._id)}
            style={{
              backgroundColor: '#d32f2f',
              color: '#ffffff',
              marginTop: '10px',
              marginLeft: '10px',
            }}
            startIcon={<Trash size={20} />}
          >
            Удалить
          </Button>
        </Box>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Добавить/Обновить популярность</DialogTitle>
          <DialogContent>
            <DialogContentText>Введите балл популярности для статьи (например, от 1 до 10):</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Балл популярности"
              type="number"
              fullWidth
              value={popularityScore}
              onChange={(e) => setPopularityScore(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Отмена
            </Button>
            <Button onClick={handleMakePopular} color="primary">
              Добавить
            </Button>
            <Button onClick={handleUpdatePopularity} color="primary">
              Обновить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  const filteredRequests = requests
    .filter((request) => {
      if (filter === 'all') return true;
      if (filter === 'popular') return request.popularityScore !== undefined;
      return request.status === filter;
    })
    .sort((a, b) => {
      if (filter === 'popular') {
        return (b.popularityScore || 0) - (a.popularityScore || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Заявки на публикацию статей
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
        <Button
          variant={filter === 'popular' ? 'contained' : 'outlined'}
          onClick={() => setFilter('popular')}
          style={{ marginRight: '10px' }}
        >
          Популярные
        </Button>
      </Box>

      <Grid container spacing={2}>
        {filteredRequests.map((request) => (
          <Grid item xs={12} sm={6} md={4} key={request._id}>
            <Card sx={{ padding: '10px', minHeight: '680px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {request.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {request.description}
                </Typography>

                {request.coverImage && (
                  <Box mt={1} mb={1}>
                    <img
                      src={request.coverImage}
                      alt="Обложка статьи"
                      style={{ borderRadius: '8px', width: '100%', height: 'auto' }}
                    />
                  </Box>
                )}

                <Button variant="text" onClick={() => handleViewContent(request._id)}>
                  Посмотреть контент
                </Button>
              </CardContent>

              <CardActions
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                {request.status === 'pending' && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <Hourglass size={24} weight="fill" color="#ff9800" style={{ marginRight: '8px' }} />
                    <Typography style={{ color: '#ff9800' }}>В ожидании</Typography>
                  </Box>
                )}
                {request.status === 'approved' && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <CheckCircle size={24} weight="fill" color="#388e3c" style={{ marginRight: '8px' }} />
                    <Typography style={{ color: '#388e3c' }}>Одобрено</Typography>
                  </Box>
                )}
                {request.status === 'rejected' && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <XSquare size={24} weight="fill" color="#d32f2f" style={{ marginRight: '8px' }} />
                    <Typography style={{ color: '#d32f2f' }}>Отклонено</Typography>
                  </Box>
                )}
                {request.popularityScore !== undefined && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <Star size={24} weight="fill" color="#ffd700" style={{ marginRight: '8px' }} />
                    <Typography style={{ color: '#ffd700' }}>{request.popularityScore}</Typography>
                    <Button
                      variant="text"
                      onClick={() => handleOpenModal(request._id)}
                      style={{ marginLeft: '10px', color: '#ffd700' }}
                    >
                      Обновить популярность
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => handleRemovePopularity(request._id)}
                      style={{ marginLeft: '10px', color: '#d32f2f' }}
                    >
                      Убрать популярность
                    </Button>
                  </Box>
                )}
                <Box display="flex" gap="8px" flexWrap="wrap">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        onClick={() => handleApprove(request._id)}
                        style={{
                          backgroundColor: '#1976d2',
                          color: '#ffffff',
                          marginBottom: '4px',
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
                          marginBottom: '4px',
                        }}
                      >
                        Отклонить
                      </Button>
                    </>
                  )}
                  <Button
                    variant="contained"
                    onClick={() => handleOpenModal(request._id)}
                    style={{
                      backgroundColor: '#ffb74d',
                      color: '#ffffff',
                      marginBottom: '4px',
                    }}
                  >
                    Сделать популярной
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleDelete(request._id)}
                    style={{
                      backgroundColor: '#d32f2f',
                      color: '#ffffff',
                      marginBottom: '4px',
                    }}
                    startIcon={<Trash size={16} />}
                  >
                    Удалить
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} message={snackbarMessage} />

      {/* Модальное окно для добавления/обновления популярности */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Добавить/Обновить популярность</DialogTitle>
        <DialogContent>
          <DialogContentText>Введите балл популярности для статьи (например, от 1 до 10):</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Балл популярности"
            type="number"
            fullWidth
            value={popularityScore}
            onChange={(e) => setPopularityScore(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Отмена
          </Button>
          <Button onClick={handleMakePopular} color="primary">
            Добавить
          </Button>
          <Button onClick={handleUpdatePopularity} color="primary">
            Обновить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ArticlesRequestsPage;
