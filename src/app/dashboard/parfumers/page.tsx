'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import axios from 'axios';

interface Parfumer {
  _id: string;
  original: string;
  original_ru: string; // добавляем поле для русского имени
  slug: string;
}

const ParfumersPage = () => {
  const [parfumers, setParfumers] = useState<Parfumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteParfumerId, setDeleteParfumerId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  // Состояния для редактирования парфюмера
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editingParfumer, setEditingParfumer] = useState<{
    newName: string;
    newSlug?: string;
    newRuName?: string;
    _id: string;
  } | null>(null);

  // Состояния для добавления парфюмера
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [newParfumer, setNewParfumer] = useState<Parfumer | null>(null);

  // Параметры пагинации
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchParfumers = async () => {
    setLoading(true);
    setParfumers([]); // Сбрасываем предыдущие парфюмеры перед новым запросом
    try {
      const response = await axios.get('http://81.29.136.136:3001/parfumers/search', {
        params: {
          query: searchQuery || '',
          page,
          limit: itemsPerPage,
        },
      });

      if (response.data.parfumers.length === 0) {
        setParfumers([]); // Устанавливаем пустой массив, если парфюмеры не найдены
      } else {
        setParfumers(response.data.parfumers); // Если парфюмеры найдены, устанавливаем их
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      setParfumers([]); // Если произошла ошибка, сбрасываем парфюмеров
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParfumers();
  }, [page, searchQuery]);

  const handleSelect = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleDelete = async () => {
    if (selected.length === 0 && !deleteParfumerId) {
      return;
    }

    try {
      if (deleteParfumerId) {
        await axios.delete(`http://81.29.136.136:3001/parfumers/${deleteParfumerId}`);
      } else {
        await Promise.all(selected.map((id) => axios.delete(`http://81.29.136.136:3001/parfumers/${id}`)));
      }
      fetchParfumers();
      setSelected([]);
      setDeleteParfumerId(null);
    } catch (error) {
      console.error('Ошибка при удалении парфюмеров:', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteIconClick = (id: string) => {
    setDeleteParfumerId(id);
    setOpenDeleteDialog(true);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    setSearchQuery(query);
    setPage(1);
  };

  const handleEditClick = async (parfumer_id: string) => {
    setOpenEditDialog(true);
    setEditingParfumer(null);
    try {
      const response = await axios.get(`http://81.29.136.136:3001/parfumers/id/${parfumer_id}`);
      setEditingParfumer({
        newName: response.data.original,
        newSlug: response.data.slug,
        newRuName: response.data.original_ru, // добавляем русское имя
        _id: response.data._id,
      });
    } catch (error) {
      console.error('Ошибка при получении данных парфюмера:', error);
      setOpenEditDialog(false);
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (editingParfumer) {
      const { name, value } = event.target;
      setEditingParfumer({
        ...editingParfumer,
        [name as string]: value,
      });
    }
  };

  const handleSaveChanges = async () => {
    if (editingParfumer) {
      try {
        await axios.put(`http://81.29.136.136:3001/parfumers/${editingParfumer._id}`, {
          newName: editingParfumer.newName,
          newSlug: editingParfumer.newSlug,
          newRuName: editingParfumer.newRuName, // сохраняем русское имя
        });
        setOpenEditDialog(false);
        fetchParfumers();
      } catch (error) {
        console.error('Ошибка при сохранении изменений:', error);
      }
    }
  };

  const handleAddClick = () => {
    setNewParfumer({
      _id: '',
      original: '',
      original_ru: '', // добавляем поле для русского имени
      slug: '',
    });
    setOpenAddDialog(true);
  };

  const handleAddChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (newParfumer) {
      const { name, value } = event.target;
      setNewParfumer({
        ...newParfumer,
        [name as string]: value,
      });
    }
  };

  const handleAddParfumer = async () => {
    if (newParfumer) {
      try {
        await axios.post('http://81.29.136.136:3001/parfumers/parfumers', {
          original: newParfumer.original,
          slug: newParfumer.slug,
          original_ru: newParfumer.original_ru, // передаем русское имя
        });
        setOpenAddDialog(false);
        fetchParfumers();
      } catch (error) {
        console.error('Ошибка при добавлении парфюмера:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Парфюмеры
      </Typography>

      <form style={{ marginTop: '30px' }} onSubmit={handleSearchSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              name="search"
              label="Поиск парфюмеров"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>
      </form>

      <Box display="flex" gap={2} style={{ marginTop: '20px' }}>
        <Button variant="contained" color="primary" startIcon={<Plus size={20} />} onClick={handleAddClick}>
          Добавить парфюмера
        </Button>

        <Button
          variant="contained"
          color="secondary"
          disabled={selected.length === 0}
          onClick={() => setOpenDeleteDialog(true)}
        >
          Удалить выбранных парфюмеров
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Имя (EN)</TableCell>
                  <TableCell>Имя (RU)</TableCell> {/* добавляем колонку для русского имени */}
                  <TableCell>Slug</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(parfumers) && parfumers.length > 0 ? (
                  parfumers.map((parfumer) => (
                    <TableRow key={parfumer._id} selected={isSelected(parfumer._id)}>
                      <TableCell>{parfumer.original}</TableCell>
                      <TableCell>{parfumer.original_ru || '—'}</TableCell> {/* выводим русское имя */}
                      <TableCell>{parfumer.slug}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" aria-label="edit" onClick={() => handleEditClick(parfumer._id)}>
                          <PencilSimple size={20} />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          aria-label="delete"
                          onClick={() => handleDeleteIconClick(parfumer._id)}
                        >
                          <Trash size={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {loading ? 'Загрузка...' : 'Парфюмеры не найдены'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" my={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Удалить парфюмера</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите удалить выбранных парфюмеров?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Редактировать парфюмера</DialogTitle>
        {editingParfumer ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Новое имя"
                  name="newName"
                  variant="outlined"
                  value={editingParfumer.newName}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Slug"
                  name="newSlug"
                  variant="outlined"
                  value={editingParfumer.newSlug || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя на русском"
                  name="newRuName"
                  variant="outlined"
                  value={editingParfumer.newRuName || ''}
                  onChange={handleEditChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
        ) : (
          <DialogContent>
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleSaveChanges} color="secondary" disabled={!editingParfumer}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить парфюмера</DialogTitle>
        {newParfumer ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя (EN)"
                  name="original"
                  variant="outlined"
                  value={newParfumer.original}
                  onChange={handleAddChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя (RU)"
                  name="original_ru"
                  variant="outlined"
                  value={newParfumer.original_ru || ''}
                  onChange={handleAddChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Slug"
                  name="slug"
                  variant="outlined"
                  value={newParfumer.slug || ''}
                  onChange={handleAddChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
        ) : null}
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleAddParfumer} color="secondary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ParfumersPage;
