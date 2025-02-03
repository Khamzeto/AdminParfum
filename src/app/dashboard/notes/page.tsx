'use client';

import React, { useEffect, useState } from 'react';
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

/** Тип ноты */
interface Note {
  _id: string;
  name: string;
  image?: string;
}

/** Функция для переименования файла */
function renameFile(originalFile: File, newName: string): File {
  return new File([originalFile], newName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  });
}
const NotesPage = () => {
  // Состояния
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  // Диалог редактирования
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<{
    newName: string;
    newImage?: string;
    _id: string;
  } | null>(null);

  // Выбранный файл для редактирования
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Диалог добавления
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<Note | null>(null);

  // Пагинация
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 20;

  // Поиск
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ===========================
  //      FETCH NOTES
  // ===========================
  const fetchNotes = async () => {
    setLoading(true);
    setNotes([]);
    try {
      const response = await axios.get('https://hltback.parfumetrika.ru/notes/search', {
        params: {
          query: searchQuery || '',
          page,
          limit: itemsPerPage,
        },
      });
      if (response.data.notes.length === 0) {
        setNotes([]);
      } else {
        setNotes(response.data.notes);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page, searchQuery]);

  // ===========================
  //      SELECT / DELETE
  // ===========================
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

  const handleDeleteIconClick = (id: string) => {
    setDeleteNoteId(id);
    setOpenDeleteDialog(true);
  };

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

  // ===========================
  //      SEARCH / PAGINATION
  // ===========================
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

  // ===========================
  //      EDIT NOTE
  // ===========================
  const handleEditClick = async (note_id: string) => {
    setOpenEditDialog(true);
    setEditingNote(null);
    setSelectedFile(null);

    try {
      const response = await axios.get(`https://hltback.parfumetrika.ru/notes/${note_id}`);
      setEditingNote({
        newName: response.data.name,
        newImage: response.data.image,
        _id: response.data._id,
      });
    } catch (error) {
      console.error('Ошибка при получении данных ноты:', error);
      setOpenEditDialog(false);
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (editingNote) {
      const { name, value } = event.target;
      setEditingNote((prev) => (prev ? { ...prev, [name as string]: value } : null));
    }
  };

  // Когда пользователь выбирает файл
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  /**
   * Загрузка файла на сервер с изменённым именем
   * 1. Переименовываем файл на клиенте
   * 2. Отправляем в FormData
   * 3. Сервер сохранит файл под новым именем
   */
  /**
   * Загрузка файла на сервер с новым именем на кириллице.
   */
  const handleFileUpload = async () => {
    // Проверяем, выбран ли файл и есть ли данные о ноте
    if (!selectedFile || !editingNote) return;

    try {
      // 1. Берём название ноты (editingNote.newName) и приводим к удобному виду
      let name = editingNote.newName.trim();

      // 2. Делаем первую букву заглавной (при желании)
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

      // 3. Определяем расширение из выбранного файла, например ".jpg" или ".jpeg"
      const dotIndex = selectedFile.name.lastIndexOf('.');
      const originalExtension = dotIndex !== -1 ? selectedFile.name.substring(dotIndex) : '';

      // 4. Формируем новое кириллическое имя файла
      //    Например, если нота называется "морской туман", получим "Морской туман.jpg"
      const newFileName = `${capitalizedName}${originalExtension}`;

      // 5. "Переименовываем" файл на клиенте
      const renamedFile = renameFile(selectedFile, newFileName);
      console.log(renameFile);
      // 6. Создаём FormData и добавляем туда файл под именем "photo"
      //    (под это настроен multer.single('photo') на бэкенде)
      const formData = new FormData();
      formData.append('photo', renamedFile);

      // 7. Отправляем POST-запрос на сервер
      //    Указываем заголовок content-type (часто Axios сделает это сам)
      const response = await axios.post('https://hltback.parfumetrika.ru/upload_notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data; charset=UTF-8',
        },
      });

      // Пример ожидаемого ответа:
      // {
      //   "message": "Файл успешно загружен",
      //   "file": {
      //     "filename": "Морской туман.jpeg",
      //     "path": "/note_images/Морской туман.jpeg"
      //   }
      // }

      const uploadedFile = response.data.file;

      // 8. Строим итоговый URL, если нужно
      //    Например, если сервер возвращает "path": "/note_images/Морской туман.jpeg"
      const imageUrl = uploadedFile.path
        ? `https://hltback.parfumetrika.ru${uploadedFile.path}`
        : uploadedFile.filename;

      // 9. Обновляем локальный state, чтобы nота знала про новое фото
      setEditingNote((prev) => (prev ? { ...prev, newImage: imageUrl } : null));
    } catch (err) {
      console.error('Ошибка при загрузке файла:', err);
    }
  };

  // Сохранение изменений (название ноты, URL картинки и т.д.)
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

  // ===========================
  //      ADD NOTE
  // ===========================
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
      setNewNote((prev) => (prev ? { ...prev, [name as string]: value } : null));
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

  // ===========================
  //      RENDER
  // ===========================
  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Ноты
      </Typography>

      {/* Search form */}
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
                        {/* Допустим, на сервере файл хранится под 
                            https://parfumetrika.ru/note_images/Имя.jpg */}
                        <img
                          src={`https://parfumetrika.ru/note_images/${encodeURIComponent(
                            note.name.charAt(0).toUpperCase() + note.name.slice(1)
                          )}.jpg`}
                          alt={note.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
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

      {/* Delete Dialog */}
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

      {/* Edit Dialog */}
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
                {/* Выбор файла */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Button variant="contained" component="label">
                    Выбрать файл
                    <input type="file" hidden onChange={handleFileChange} />
                  </Button>
                  {selectedFile && <Typography>{selectedFile.name}</Typography>}
                </Box>

                {/* Кнопка загрузки */}
                <Box mt={2}>
                  <Button variant="contained" color="secondary" disabled={!selectedFile} onClick={handleFileUpload}>
                    Загрузить фото
                  </Button>
                </Box>
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

      {/* Add Dialog */}
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
