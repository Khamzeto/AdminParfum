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

  // Добавляем состояние для редактирования
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

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
      await axios.delete(`https://hltback.parfumetrika.ru/news/requests/${id}`);
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

  // Функции для редактирования
  const startEditing = (id: string, newsItem: News) => {
    setEditingNewsId(id);
    setEditData({ ...newsItem }); // Копируем данные новости
  };

  const cancelEditing = () => {
    setEditingNewsId(null);
    setEditData({});
  };

  const handleUpdateNews = async () => {
    if (!editingNewsId) return;
    try {
      await axios.put(`https://hltback.parfumetrika.ru/news/requests/${editingNewsId}`, {
        title: editData.title,
        description: editData.description,
        content: editData.content,
        coverImage: editData.coverImage,
      });
      setNews((prevNews) => prevNews.map((item) => (item._id === editingNewsId ? { ...item, ...editData } : item)));
      setSnackbarMessage('Новость обновлена');
      setSnackbarOpen(true);
      cancelEditing();
    } catch (error) {
      console.error('Ошибка при обновлении новости:', error);
    }
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

    const isEditing = editingNewsId === fullScreenContentId;

    if (!fullScreenNews) {
      return <Typography>Новость не найдена</Typography>;
    }

    return (
      <Container>
        <Button variant="outlined" onClick={handleBackToList} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={20} style={{ marginRight: '10px' }} />
          Назад
        </Button>

        {isEditing ? (
          <>
            <TextField
              label="Заголовок"
              variant="outlined"
              fullWidth
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              style={{ marginBottom: '20px' }}
            />

            <TextField
              label="Описание"
              variant="outlined"
              fullWidth
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              style={{ marginBottom: '20px' }}
            />

            <TextField
              label="Обложка (URL)"
              variant="outlined"
              fullWidth
              value={editData.coverImage || ''}
              onChange={(e) => setEditData({ ...editData, coverImage: e.target.value })}
              style={{ marginBottom: '20px' }}
            />

            <TextField
              label="Контент"
              variant="outlined"
              fullWidth
              multiline
              minRows={10}
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              style={{ marginBottom: '20px' }}
            />

            <Box display="flex" gap="10px">
              <Button
                variant="contained"
                onClick={handleUpdateNews}
                style={{
                  backgroundColor: '#388e3c',
                  color: '#ffffff',
                }}
              >
                Сохранить
              </Button>
              <Button
                variant="contained"
                onClick={cancelEditing}
                style={{
                  backgroundColor: '#d32f2f',
                  color: '#ffffff',
                }}
              >
                Отменить
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              {fullScreenNews.title}
            </Typography>

            {fullScreenNews.coverImage && (
              <Box mb={2}>
                <img
                  src={fullScreenNews.coverImage}
                  alt="Обложка новости"
                  style={{ borderRadius: '8px', width: '100%', height: 'auto' }}
                />
              </Box>
            )}

            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: fullScreenNews.content || '' }} />

            <Box mt={4} display="flex" gap="10px" flexWrap="wrap">
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
              <Button
                variant="contained"
                onClick={() => startEditing(fullScreenNews._id, fullScreenNews)}
                style={{
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                }}
              >
                Изменить
              </Button>
            </Box>
          </>
        )}

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
        {filteredNews.map((item) => {
          const isEditing = editingNewsId === item._id;

          return (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card sx={{ minHeight: '750px', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {isEditing ? (
                    <>
                      <TextField
                        label="Заголовок"
                        variant="outlined"
                        fullWidth
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        style={{ marginBottom: '10px' }}
                      />

                      <TextField
                        label="Описание"
                        variant="outlined"
                        fullWidth
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        style={{ marginBottom: '10px' }}
                      />

                      <TextField
                        label="Обложка (URL)"
                        variant="outlined"
                        fullWidth
                        value={editData.coverImage || ''}
                        onChange={(e) => setEditData({ ...editData, coverImage: e.target.value })}
                        style={{ marginBottom: '10px' }}
                      />

                      <TextField
                        label="Контент"
                        variant="outlined"
                        fullWidth
                        multiline
                        minRows={4}
                        value={editData.content}
                        onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                        style={{ marginBottom: '10px' }}
                      />

                      <Box display="flex" gap="10px">
                        <Button
                          variant="contained"
                          onClick={handleUpdateNews}
                          style={{
                            backgroundColor: '#388e3c',
                            color: '#ffffff',
                          }}
                        >
                          Сохранить
                        </Button>
                        <Button
                          variant="contained"
                          onClick={cancelEditing}
                          style={{
                            backgroundColor: '#d32f2f',
                            color: '#ffffff',
                          }}
                        >
                          Отменить
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </CardContent>

                {!isEditing && (
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
                      <Button
                        variant="contained"
                        onClick={() => startEditing(item._id, item)}
                        style={{
                          backgroundColor: '#1976d2',
                          color: '#ffffff',
                          marginBottom: '4px',
                        }}
                      >
                        Изменить
                      </Button>
                    </Box>
                  </CardActions>
                )}
              </Card>
            </Grid>
          );
        })}
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
