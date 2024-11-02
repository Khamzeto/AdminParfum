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

interface Note {
  _id: string;
  name: string;
  image?: string;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  console.log(notes);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  // Состояния для редактирования ноты
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<{ newName: string; newImage?: string; _id: string } | null>(null);

  // Состояния для добавления ноты
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<Note | null>(null);

  // Параметры пагинации
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchNotes = async () => {
    setLoading(true);
    setNotes([]); // Сбрасываем предыдущие ноты перед новым запросом
    try {
      const response = await axios.get('https://hltback.parfumetrika.ru/notes/search', {
        params: {
          query: searchQuery || '',
          page,
          limit: itemsPerPage,
        },
      });

      if (response.data.notes.length === 0) {
        setNotes([]); // Устанавливаем пустой массив, если ноты не найдены
      } else {
        setNotes(response.data.notes); // Если ноты найдены, устанавливаем их
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      setNotes([]); // Если произошла ошибка, сбрасываем ноты
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
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
    if (selected.length === 0 && !deleteNoteId) {
      return;
    }

    try {
      if (deleteNoteId) {
        await axios.delete(`https://hltback.parfumetrika.ru/notes/${deleteNoteId}`);
      } else {
        await Promise.all(selected.map((id) => axios.delete(`https://hltback.parfumetrika.ru/notes/${id}`)));
      }
      fetchNotes();
      setSelected([]);
      setDeleteNoteId(null);
    } catch (error) {
      console.error('Ошибка при удалении нот:', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteIconClick = (id: string) => {
    setDeleteNoteId(id);
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

  const handleEditClick = async (note_id: string) => {
    setOpenEditDialog(true);
    setEditingNote(null);
    try {
      const response = await axios.get(`https://hltback.parfumetrika.ru/notes/${note_id}`);
      setEditingNote({ newName: response.data.name, newImage: response.data.image, _id: response.data._id });
    } catch (error) {
      console.error('Ошибка при получении данных ноты:', error);
      setOpenEditDialog(false);
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (editingNote) {
      const { name, value } = event.target;
      setEditingNote({
        ...editingNote,
        [name as string]: value,
      });
    }
  };

  const handleSaveChanges = async () => {
    if (editingNote) {
      try {
        await axios.put(`https://hltback.parfumetrika.ru/notes/replace/${editingNote._id}`, editingNote);
        setOpenEditDialog(false);
        fetchNotes();
      } catch (error) {
        console.error('Ошибка при сохранении изменений:', error);
      }
    }
  };

  const handleAddClick = () => {
    setNewNote({
      _id: '',
      name: '',
      image: '',
    });
    setOpenAddDialog(true);
  };

  const handleAddChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (newNote) {
      const { name, value } = event.target;
      setNewNote({
        ...newNote,
        [name as string]: value,
      });
    }
  };

  const handleAddNote = async () => {
    if (newNote) {
      try {
        await axios.post('https://hltback.parfumetrika.ru/notes', newNote);
        setOpenAddDialog(false);
        fetchNotes();
      } catch (error) {
        console.error('Ошибка при добавлении ноты:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Ноты
      </Typography>

      <form style={{ marginTop: '30px' }} onSubmit={handleSearchSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              name="search"
              label="Поиск нот"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>
      </form>

      <Box display="flex" gap={2} style={{ marginTop: '20px' }}>
        <Button variant="contained" color="primary" startIcon={<Plus size={20} />} onClick={handleAddClick}>
          Добавить ноту
        </Button>

        <Button
          variant="contained"
          color="secondary"
          disabled={selected.length === 0}
          onClick={() => setOpenDeleteDialog(true)}
        >
          Удалить выбранные ноты
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
                  <TableCell>Название</TableCell>
                  <TableCell>Фото</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(notes) && notes.length > 0 ? (
                  notes.map((note) => (
                    <TableRow key={note._id} selected={isSelected(note._id)}>
                      <TableCell>{note.name}</TableCell>
                      <TableCell>
                        {note.image && (
                          <img
                            src={note.image}
                            alt={note.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" aria-label="edit" onClick={() => handleEditClick(note._id)}>
                          <PencilSimple size={20} />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          aria-label="delete"
                          onClick={() => handleDeleteIconClick(note._id)}
                        >
                          <Trash size={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {loading ? 'Загрузка...' : 'Ноты не найдены'}
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
        <DialogTitle>Удалить ноту</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите удалить выбранные ноты?</DialogContentText>
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
        <DialogTitle>Редактировать ноту</DialogTitle>
        {editingNote ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Новое название"
                  name="newName"
                  variant="outlined"
                  value={editingNote.newName}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL изображения"
                  name="newImage"
                  variant="outlined"
                  value={editingNote.newImage || ''}
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
          <Button onClick={handleSaveChanges} color="secondary" disabled={!editingNote}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить ноту</DialogTitle>
        {newNote ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название"
                  name="name"
                  variant="outlined"
                  value={newNote.name}
                  onChange={handleAddChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL изображения"
                  name="image"
                  variant="outlined"
                  value={newNote.image || ''}
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
          <Button onClick={handleAddNote} color="secondary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NotesPage;
