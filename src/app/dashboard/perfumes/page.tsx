'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
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
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import NoteSearchAutocomplete from '@/components/dashboard/perfumes/notes'; // Компонент для поиска нот

interface Perfume {
  _id: string;
  perfume_id: string;
  name: string;
  brand: string;
  description: string;
  accords: string[];
  gender: string;
  rating_value: number;
  rating_count: number;
  main_image: string;
  notes: {
    top_notes: string[];
    heart_notes: string[];
    base_notes: string[];
  };
}
interface Note {
  name: string;
}

const PerfumesPage = () => {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [deletePerfumeId, setDeletePerfumeId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  // Состояния для редактирования парфюма
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editingPerfume, setEditingPerfume] = useState<Perfume | null>(null);

  // Состояния для добавления парфюма
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [newPerfume, setNewPerfume] = useState<Perfume | null>(null);

  // Состояния для нот
  const [selectedTopNotes, setSelectedTopNotes] = useState<any[]>([]);
  const [selectedHeartNotes, setSelectedHeartNotes] = useState<any[]>([]);
  const [selectedBaseNotes, setSelectedBaseNotes] = useState<any[]>([]);

  const [newSelectedTopNotes, setNewSelectedTopNotes] = useState<any[]>([]);
  const [newSelectedHeartNotes, setNewSelectedHeartNotes] = useState<any[]>([]);
  const [newSelectedBaseNotes, setNewSelectedBaseNotes] = useState<any[]>([]);

  // Параметры пагинации
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 20;
  const [sortBy, setSortBy] = useState<string>('popular');
  const [gender, setGender] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [releaseYear, setReleaseYear] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchPerfumes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://81.29.136.136:3001/perfumes/search', {
        params: {
          query: searchQuery || 'perfumes',
          page,
          limit: itemsPerPage,
          sortBy,
          gender,
          brands: selectedBrands,
          year: releaseYear,
        },
      });

      setPerfumes(response.data.results);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfumes();
  }, [page, sortBy, gender, selectedBrands, releaseYear, searchQuery]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = perfumes.map((perfume) => perfume.perfume_id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

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
    if (selected.length === 0 && !deletePerfumeId) {
      return;
    }

    try {
      if (deletePerfumeId) {
        await axios.delete(`http://81.29.136.136:3001/perfumes/${deletePerfumeId}`);
      } else {
        await Promise.all(selected.map((id) => axios.delete(`http://81.29.136.136:3001/perfumes/${id}`)));
      }
      fetchPerfumes();
      setSelected([]);
      setDeletePerfumeId(null);
    } catch (error) {
      console.error('Ошибка при удалении парфюмов:', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteIconClick = (id: string) => {
    setDeletePerfumeId(id);
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

  const handleEditClick = async (perfume_id: string) => {
    setOpenEditDialog(true);
    setEditingPerfume(null);
    try {
      const response = await axios.get(`http://81.29.136.136:3001/perfumes/${perfume_id}`);
      setEditingPerfume(response.data);

      // Устанавливаем текущие ноты в состояние
      setSelectedTopNotes(response.data.notes.top_notes.map((note: string) => ({ name: note })));
      setSelectedHeartNotes(response.data.notes.heart_notes.map((note: string) => ({ name: note })));
      setSelectedBaseNotes(response.data.notes.base_notes.map((note: string) => ({ name: note })));
    } catch (error) {
      console.error('Ошибка при получении данных парфюма:', error);
      setOpenEditDialog(false);
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (editingPerfume) {
      const { name, value } = event.target;
      setEditingPerfume({
        ...editingPerfume,
        [name as string]: value,
      });
    }
  };

  const handleSaveChanges = async () => {
    if (editingPerfume) {
      try {
        await axios.put(`http://81.29.136.136:3001/perfumes/${editingPerfume._id}`, {
          ...editingPerfume,
          notes: {
            top_notes: selectedTopNotes.map((note) => note.name),
            heart_notes: selectedHeartNotes.map((note) => note.name),
            base_notes: selectedBaseNotes.map((note) => note.name),
          },
        });
        setOpenEditDialog(false);
        fetchPerfumes();
      } catch (error) {
        console.error('Ошибка при сохранении изменений:', error);
      }
    }
  };

  const generateObjectId = (): string => {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16)).toLowerCase();
  };

  const handleAddClick = () => {
    const newId = generateObjectId();
    setNewPerfume({
      _id: newId,
      perfume_id: newId,
      name: '',
      brand: '',
      description: '',
      accords: [],
      gender: '',
      rating_value: 0,
      rating_count: 0,
      main_image: '',
      notes: {
        top_notes: [],
        heart_notes: [],
        base_notes: [],
      },
    });
    setNewSelectedTopNotes([]);
    setNewSelectedHeartNotes([]);
    setNewSelectedBaseNotes([]);
    setOpenAddDialog(true);
  };

  const handleAddChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (newPerfume) {
      const { name, value } = event.target;
      setNewPerfume({
        ...newPerfume,
        [name as string]: value,
      });
    }
  };

  const handleAddPerfume = async () => {
    if (newPerfume) {
      try {
        await axios.post('http://81.29.136.136:3001/perfumes', {
          ...newPerfume,
          notes: {
            top_notes: newSelectedTopNotes.map((note) => note.name),
            heart_notes: newSelectedHeartNotes.map((note) => note.name),
            base_notes: newSelectedBaseNotes.map((note) => note.name),
          },
        });
        setOpenAddDialog(false);
        fetchPerfumes();
      } catch (error) {
        console.error('Ошибка при добавлении парфюма:', error);
      }
    }
  };

  const handleNotesChange = (newNotes: Note[], type: string) => {
    if (type === 'top_notes') {
      setSelectedTopNotes(newNotes);
    } else if (type === 'heart_notes') {
      setSelectedHeartNotes(newNotes);
    } else if (type === 'base_notes') {
      setSelectedBaseNotes(newNotes);
    }
  };

  const handleAddNotesChange = (newNotes: any[], type: string) => {
    switch (type) {
      case 'top_notes':
        setNewSelectedTopNotes(newNotes);
        break;
      case 'heart_notes':
        setNewSelectedHeartNotes(newNotes);
        break;
      case 'base_notes':
        setNewSelectedBaseNotes(newNotes);
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Парфюмы
      </Typography>

      <form style={{ marginTop: '30px' }} onSubmit={handleSearchSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              name="search"
              label="Поиск парфюмов"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>
      </form>

      <Box display="flex" gap={2} style={{ marginTop: '20px' }}>
        <Button variant="contained" color="primary" startIcon={<Plus size={20} />} onClick={handleAddClick}>
          Добавить парфюм
        </Button>

        <Button
          variant="contained"
          color="secondary"
          disabled={selected.length === 0}
          onClick={() => setOpenDeleteDialog(true)}
        >
          Удалить выбранные парфюмы
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < perfumes.length}
                      checked={perfumes?.length > 0 && selected.length === perfumes.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Фото</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Рейтинг</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {perfumes.map((perfume) => (
                  <TableRow key={perfume.perfume_id} selected={isSelected(perfume.perfume_id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(perfume.perfume_id)}
                        onChange={() => handleSelect(perfume.perfume_id)}
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={
                          perfume.main_image.startsWith('http')
                            ? perfume.main_image
                            : `http://81.29.136.136:3001/${perfume.main_image}`
                        }
                        alt={perfume.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell>{perfume.name}</TableCell>
                    <TableCell>{perfume.description}</TableCell>
                    <TableCell>
                      {perfume.rating_value} ({perfume.rating_count} отзывов)
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" aria-label="edit" onClick={() => handleEditClick(perfume.perfume_id)}>
                        <PencilSimple size={20} />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        aria-label="delete"
                        onClick={() => handleDeleteIconClick(perfume._id)}
                      >
                        <Trash size={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
        <DialogTitle>Удалить парфюм</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите удалить выбранные парфюмы?</DialogContentText>
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
        <DialogTitle>Редактировать парфюм</DialogTitle>
        {editingPerfume ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Название"
                  name="name"
                  variant="outlined"
                  value={editingPerfume.name}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Бренд"
                  name="brand"
                  variant="outlined"
                  value={editingPerfume.brand}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  name="description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={editingPerfume.description}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="gender-label">Пол</InputLabel>
                  <Select
                    labelId="gender-label"
                    label="Пол"
                    name="gender"
                    value={editingPerfume.gender}
                    onChange={handleEditChange}
                  >
                    <MenuItem value="male">Мужской</MenuItem>
                    <MenuItem value="female">Женский</MenuItem>
                    <MenuItem value="unisex">Унисекс</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Аккорды (через запятую)"
                  name="accords"
                  variant="outlined"
                  value={editingPerfume.accords.join(', ')}
                  onChange={(e) =>
                    setEditingPerfume({
                      ...editingPerfume,
                      accords: e.target.value.split(',').map((item) => item.trim()),
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Ноты</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <NoteSearchAutocomplete
                  label="Верхние ноты"
                  selectedNotes={selectedTopNotes}
                  onNotesChange={(newNotes) => handleNotesChange(newNotes, 'top_notes')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <NoteSearchAutocomplete
                  label="Сердечные ноты"
                  selectedNotes={selectedHeartNotes}
                  onNotesChange={(newNotes) => handleNotesChange(newNotes, 'heart_notes')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <NoteSearchAutocomplete
                  label="Базовые ноты"
                  selectedNotes={selectedBaseNotes}
                  onNotesChange={(newNotes) => handleNotesChange(newNotes, 'base_notes')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL изображения"
                  name="main_image"
                  variant="outlined"
                  value={editingPerfume.main_image}
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
          <Button onClick={handleSaveChanges} color="secondary" disabled={!editingPerfume}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить парфюм</DialogTitle>
        {newPerfume ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Название"
                  name="name"
                  variant="outlined"
                  value={newPerfume.name}
                  onChange={handleAddChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Бренд"
                  name="brand"
                  variant="outlined"
                  value={newPerfume.brand}
                  onChange={handleAddChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  name="description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={newPerfume.description}
                  onChange={handleAddChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="gender-label-add">Пол</InputLabel>
                  <Select
                    labelId="gender-label-add"
                    label="Пол"
                    name="gender"
                    value={newPerfume.gender}
                    onChange={handleAddChange}
                  >
                    <MenuItem value="male">Мужской</MenuItem>
                    <MenuItem value="female">Женский</MenuItem>
                    <MenuItem value="unisex">Унисекс</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Аккорды (через запятую)"
                  name="accords"
                  variant="outlined"
                  value={newPerfume.accords.join(', ')}
                  onChange={(e) =>
                    setNewPerfume({
                      ...newPerfume,
                      accords: e.target.value.split(',').map((item) => item.trim()),
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Ноты</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <NoteSearchAutocomplete
                  label="Верхние ноты"
                  selectedNotes={newSelectedTopNotes}
                  onNotesChange={(newNotes) => handleAddNotesChange(newNotes, 'top_notes')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <NoteSearchAutocomplete
                  label="Сердечные ноты"
                  selectedNotes={newSelectedHeartNotes}
                  onNotesChange={(newNotes) => handleAddNotesChange(newNotes, 'heart_notes')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <NoteSearchAutocomplete
                  label="Базовые ноты"
                  selectedNotes={newSelectedBaseNotes}
                  onNotesChange={(newNotes) => handleAddNotesChange(newNotes, 'base_notes')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL изображения"
                  name="main_image"
                  variant="outlined"
                  value={newPerfume.main_image}
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
          <Button onClick={handleAddPerfume} color="secondary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PerfumesPage;
