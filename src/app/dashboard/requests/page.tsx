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

interface Request {
  _id: string;
  perfumeId: Perfume;
  changes: any;
  status: string;
  createdAt: string;
}

interface Perfume {
  name: string;
  brand: string;
  notes: {
    top_notes: string[];
    heart_notes: string[];
    base_notes: string[];
    additional_notes: string[];
  };
  accords: string[];
  [key: string]: any;
}

const RequestsPage = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1); // Текущая страница
  const [totalPages, setTotalPages] = useState(1); // Общее количество страниц

  const limit = 10; // Количество заявок на страницу

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://hltback.parfumetrika.ru/requests', {
          params: {
            page,
            limit,
            status: filter === 'all' ? undefined : filter,
          },
        });
        setRequests(response.data.requests);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Ошибка при получении заявок:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page, filter]);

  const handleApprove = async (id: string) => {
    try {
      await axios.put(`https://hltback.parfumetrika.ru/requests/approve/${id}`);
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === id ? { ...request, status: 'approved' } : request))
      );
      setSnackbarMessage('Заявка одобрена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при одобрении заявки:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.put(`https://hltback.parfumetrika.ru/requests/reject/${id}`);
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === id ? { ...request, status: 'rejected' } : request))
      );
      setSnackbarMessage('Заявка отклонена');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при отклонении заявки:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const highlightChanges = (original: any, changes: any, parentKey = '') => {
    return Object.keys(changes).map((key) => {
      const originalValue = original[key];
      const newValue = changes[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (Array.isArray(originalValue) && Array.isArray(newValue)) {
        const addedValues = newValue.filter((item) => !originalValue.includes(item));
        const removedValues = originalValue.filter((item) => !newValue.includes(item));

        if (addedValues.length > 0 || removedValues.length > 0) {
          return (
            <Typography key={fullKey}>
              <strong>{fullKey}:</strong>{' '}
              {addedValues.length > 0 && <span style={{ color: 'green' }}>Добавлено: {addedValues.join(', ')}</span>}
              {removedValues.length > 0 && <span style={{ color: 'red' }}> Удалено: {removedValues.join(', ')}</span>}
            </Typography>
          );
        } else {
          return (
            <Typography key={fullKey}>
              <strong>{fullKey}:</strong> Нет изменений
            </Typography>
          );
        }
      }

      if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
        return (
          <React.Fragment key={fullKey}>{highlightChanges(originalValue || {}, newValue, fullKey)}</React.Fragment>
        );
      }

      if (originalValue !== newValue) {
        return (
          <Typography key={fullKey}>
            <strong>{fullKey}:</strong> <span style={{ color: 'green' }}>{String(newValue)}</span>
          </Typography>
        );
      } else {
        return (
          <Typography key={fullKey}>
            <strong>{fullKey}:</strong> Нет изменений
          </Typography>
        );
      }
    });
  };

  const renderNotes = (notes: { top_notes: string[]; heart_notes: string[]; base_notes: string[] }) => (
    <>
      <Typography>
        <strong>Верхние ноты:</strong> {notes.top_notes ? notes.top_notes.join(', ') : 'Нет данных'}
      </Typography>
      <Typography>
        <strong>Средние ноты:</strong> {notes.heart_notes ? notes.heart_notes.join(', ') : 'Нет данных'}
      </Typography>
      <Typography>
        <strong>Базовые ноты:</strong> {notes.base_notes ? notes.base_notes.join(', ') : 'Нет данных'}
      </Typography>
    </>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const filteredRequests = requests.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Заявки на изменение парфюмов
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
                  Заявка на изменение парфюма: {request.perfumeId.name} ({request.perfumeId.brand})
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Дата создания: {new Date(request.createdAt).toLocaleString()}
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  Оригинальные ноты:
                </Typography>
                {renderNotes(request.perfumeId.notes)}

                <Typography variant="subtitle1" gutterBottom>
                  Измененные поля:
                </Typography>
                {highlightChanges(request.perfumeId, request.changes)}
              </CardContent>
              <CardActions style={{ paddingLeft: '8px' }}>
                {request.status === 'pending' && (
                  <>
                    <div style={{ paddingBottom: '20px', paddingLeft: '14px' }}>
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
                    <Box display="flex" alignItems="center" style={{ paddingBottom: '20px', paddingLeft: '14px' }}>
                      <Hourglass size={24} weight="fill" color="#ff9800" style={{ marginRight: '8px' }} />
                      <Typography style={{ color: '#ff9800' }}>В ожидании обработки</Typography>
                    </Box>
                  </>
                )}
                {request.status === 'approved' && (
                  <Box display="flex" alignItems="center" style={{ paddingBottom: '20px', paddingLeft: '14px' }}>
                    <CheckCircle size={24} weight="fill" color="#388e3c" style={{ marginRight: '8px' }} />
                    <Typography style={{ color: '#388e3c' }}>Одобрено</Typography>
                  </Box>
                )}
                {request.status === 'rejected' && (
                  <Box display="flex" alignItems="center" style={{ paddingBottom: '20px', paddingLeft: '14px' }}>
                    <XSquare size={24} weight="fill" color="#d32f2f" style={{ marginRight: '8px' }} />
                    <Typography style={{ color: '#d32f2f' }}>Отклонено</Typography>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Навигация по страницам */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="outlined"
          onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
          disabled={page === 1}
        >
          Предыдущая
        </Button>
        <Typography variant="body1" style={{ padding: '15px 15px' }}>
          Страница {page} из {totalPages}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setPage((prevPage) => Math.min(prevPage + 1, totalPages))}
          disabled={page === totalPages}
        >
          Следующая
        </Button>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} message={snackbarMessage} />
    </Container>
  );
};

export default RequestsPage;
