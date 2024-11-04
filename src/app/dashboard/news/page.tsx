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
import { ArrowLeft, Star, Trash } from '@phosphor-icons/react';
import axios from 'axios';

interface News {
  _id: string;
  title: string;
  description: string;
  content: string;
  coverImage?: string;
  popularityScore?: number;
  createdAt: string;
}

const NewsPage = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [fullScreenContentId, setFullScreenContentId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [popularityScore, setPopularityScore] = useState('');
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);

  // Получение данных новостей
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://hltback.parfumetrika.ru/news/requests');
        setNews(response.data.requests || []);
      } catch (error) {
        console.error('Ошибка при получении новостей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleOpenModal = (id: string) => {
    setSelectedNewsId(id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setPopularityScore('');
  };

  // Отметить новость как популярную
  const handleMakePopular = async () => {
    if (!selectedNewsId || !popularityScore.trim()) return;
    try {
      await axios.post(`https://hltback.parfumetrika.ru/news/requests/${selectedNewsId}/popular`, {
        score: Number(popularityScore),
      });
      setNews((prevNews) =>
        prevNews.map((item) =>
          item._id === selectedNewsId ? { ...item, popularityScore: Number(popularityScore) } : item
        )
      );
      setSnackbarMessage('Новость отмечена как популярная');
      setSnackbarOpen(true);
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка при отметке новости как популярной:', error);
    }
  };

  // Обновить балл популярности
  const handleUpdatePopularity = async () => {
    if (!selectedNewsId || !popularityScore.trim()) return;
    try {
      await axios.put(`https://hltback.parfumetrika.ru/news/${selectedNewsId}/popular`, {
        score: Number(popularityScore),
      });
      setNews((prevNews) =>
        prevNews.map((item) =>
          item._id === selectedNewsId ? { ...item, popularityScore: Number(popularityScore) } : item
        )
      );
      setSnackbarMessage('Балл популярности обновлен');
      setSnackbarOpen(true);
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка при обновлении балла популярности:', error);
    }
  };

  // Убрать популярность
  const handleRemovePopularity = async (id: string) => {
    try {
      await axios.put(`https://hltback.parfumetrika.ru/news/requests/${id}/unpopular`);
      setNews((prevNews) => prevNews.map((item) => (item._id === id ? { ...item, popularityScore: undefined } : item)));
      setSnackbarMessage('Популярность новости убрана');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при удалении популярности новости:', error);
    }
  };

  // Удалить новость
  const handleDeleteNews = async (id: string) => {
    try {
      await axios.delete(`https://hltback.parfumetrika.ru/news/${id}`);
      setNews((prevNews) => prevNews.filter((item) => item._id !== id));
      setSnackbarMessage('Новость удалена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при удалении новости:', error);
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
    const fullScreenNews = news.find((item) => item._id === fullScreenContentId);

    return (
      <Container>
        <Button variant="outlined" onClick={handleBackToList} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={20} style={{ marginRight: '10px' }} />
          Назад
        </Button>

        <Typography variant="h4" gutterBottom>
          {fullScreenNews?.title}
        </Typography>

        {fullScreenNews?.coverImage && (
          <Box mb={2}>
            <img
              src={fullScreenNews.coverImage}
              alt="Обложка новости"
              style={{ borderRadius: '8px', width: '100%', height: 'auto' }}
            />
          </Box>
        )}

        <Typography variant="body1" dangerouslySetInnerHTML={{ __html: fullScreenNews?.content || '' }} />

        <Box mt={4} display="flex" gap="10px">
          <Button
            variant="contained"
            onClick={() => handleOpenModal(fullScreenNews._id)}
            style={{
              backgroundColor: '#ffb74d',
              color: '#ffffff',
            }}
          >
            Сделать популярной
          </Button>
          <Button
            variant="contained"
            onClick={() => handleDeleteNews(fullScreenNews._id)}
            style={{
              backgroundColor: '#d32f2f',
              color: '#ffffff',
            }}
            startIcon={<Trash size={20} />}
          >
            Удалить
          </Button>
        </Box>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Добавить/Обновить популярность</DialogTitle>
          <DialogContent>
            <DialogContentText>Введите балл популярности для новости (например, от 1 до 10):</DialogContentText>
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

  const filteredNews = Array.isArray(news)
    ? news
        .filter((item) => {
          if (filter === 'all') return true;
          if (filter === 'popular') return item.popularityScore !== undefined;
          return true;
        })
        .sort((a, b) => {
          if (filter === 'popular') {
            return (b.popularityScore || 0) - (a.popularityScore || 0);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
    : [];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Новости
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
          variant={filter === 'popular' ? 'contained' : 'outlined'}
          onClick={() => setFilter('popular')}
          style={{ marginRight: '10px' }}
        >
          Популярные
        </Button>
      </Box>

      <Grid container spacing={2}>
        {filteredNews.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card sx={{ minHeight: '750px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.description}
                </Typography>

                {item.coverImage && (
                  <Box mt={1} mb={1}>
                    <img
                      src={item.coverImage}
                      alt="Обложка новости"
                      style={{ borderRadius: '8px', width: '100%', height: 'auto' }}
                    />
                  </Box>
                )}

                <Button variant="text" onClick={() => handleViewContent(item._id)}>
                  Посмотреть контент
                </Button>
              </CardContent>

              <CardActions sx={{ padding: '8px', flexDirection: 'column' }}>
                {item.popularityScore !== undefined && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <Star size={24} weight="fill" color="#ffd700" style={{ marginRight: '8px' }} />
                    <Typography style={{ color: '#ffd700' }}>{item.popularityScore}</Typography>
                    <Button
                      variant="text"
                      onClick={() => handleOpenModal(item._id)}
                      style={{ marginLeft: '10px', color: '#ffd700' }}
                    >
                      Обновить популярность
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => handleRemovePopularity(item._id)}
                      style={{ marginLeft: '10px', color: '#d32f2f' }}
                    >
                      Убрать популярность
                    </Button>
                  </Box>
                )}
                <Box display="flex" gap="8px" flexWrap="wrap">
                  <Button
                    variant="contained"
                    onClick={() => handleOpenModal(item._id)}
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
                    onClick={() => handleDeleteNews(item._id)}
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
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Добавить/Обновить популярность</DialogTitle>
        <DialogContent>
          <DialogContentText>Введите балл популярности для новости (например, от 1 до 10):</DialogContentText>
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

export default NewsPage;
