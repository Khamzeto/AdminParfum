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

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  roles?: string[]; // Добавляем поле ролей
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  // Состояния для редактирования пользователя
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>(''); // Для роли

  // Состояния для добавления пользователя
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<User | null>(null);

  // Параметры пагинации
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://hltback.parfumetrika.ru/users', {
        params: {
          page,
          limit: itemsPerPage,
        },
      });

      setUsers(response.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = users.map((user) => user._id);
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
    if (selected.length === 0 && !deleteUserId) {
      return;
    }

    try {
      if (deleteUserId) {
        await axios.delete(`https://hltback.parfumetrika.ru/users/${deleteUserId}`);
      } else {
        await Promise.all(selected.map((id) => axios.delete(`https://hltback.parfumetrika.ru/users/${id}`)));
      }
      fetchUsers();
      setSelected([]);
      setDeleteUserId(null);
    } catch (error) {
      console.error('Ошибка при удалении пользователей:', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteIconClick = (id: string) => {
    setDeleteUserId(id);
    setOpenDeleteDialog(true);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleEditClick = async (userId: string) => {
    setOpenEditDialog(true);
    setEditingUser(null);
    try {
      const response = await axios.get(`https://hltback.parfumetrika.ru/users/${userId}`);
      setEditingUser(response.data);
      setRole(response.data.roles ? response.data.roles.join(', ') : ''); // Устанавливаем роль для редактирования
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      setOpenEditDialog(false);
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingUser) {
      const { name, value } = event.target;
      if (name === 'roles') {
        setRole(value); // Обновляем роль отдельно
      } else {
        setEditingUser({
          ...editingUser,
          [name]: value,
        });
      }
    }
  };

  const handleSaveChanges = async () => {
    if (editingUser) {
      try {
        await axios.put(`https://hltback.parfumetrika.ru/users/${editingUser._id}`, editingUser);
        // После сохранения отправляем запрос на обновление роли
        if (role) {
          await axios.post('https://hltback.parfumetrika.ru/auth/assign-role', {
            userId: editingUser._id,
            role,
          });
        }
        setOpenEditDialog(false);
        fetchUsers();
      } catch (error) {
        console.error('Ошибка при сохранении изменений:', error);
      }
    }
  };

  const handleAddClick = () => {
    setNewUser({
      _id: '',
      username: '',
      email: '',
      createdAt: new Date().toISOString(),
    });
    setOpenAddDialog(true);
  };

  const handleAddChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (newUser) {
      const { name, value } = event.target;
      setNewUser({
        ...newUser,
        [name]: value,
      });
    }
  };

  const handleAddUser = async () => {
    if (newUser) {
      try {
        await axios.post('https://hltback.parfumetrika.ru/users', newUser);
        setOpenAddDialog(false);
        fetchUsers();
      } catch (error) {
        console.error('Ошибка при добавлении пользователя:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Пользователи
      </Typography>

      <Box display="flex" gap={2} style={{ marginTop: '20px' }}>
        <Button variant="contained" color="primary" startIcon={<Plus size={20} />} onClick={handleAddClick}>
          Добавить пользователя
        </Button>

        <Button
          variant="contained"
          color="secondary"
          disabled={selected.length === 0}
          onClick={() => setOpenDeleteDialog(true)}
        >
          Удалить выбранных пользователей
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
                      indeterminate={selected.length > 0 && selected.length < (users?.length || 0)}
                      checked={(users?.length || 0) > 0 && selected.length === (users?.length || 0)}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Дата создания</TableCell>
                  <TableCell>Роли</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user._id} selected={isSelected(user._id)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isSelected(user._id)} onChange={() => handleSelect(user._id)} />
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{user.roles ? user.roles.join(', ') : 'Нет ролей'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" aria-label="edit" onClick={() => handleEditClick(user._id)}>
                        <PencilSimple size={20} />
                      </IconButton>
                      <IconButton color="secondary" aria-label="delete" onClick={() => handleDeleteIconClick(user._id)}>
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
        <DialogTitle>Удалить пользователя</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите удалить выбранных пользователей?</DialogContentText>
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
        <DialogTitle>Редактировать пользователя</DialogTitle>
        {editingUser ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="username"
                  variant="outlined"
                  value={editingUser.username}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  variant="outlined"
                  value={editingUser.email}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Роль"
                  name="roles"
                  variant="outlined"
                  value={role} // Преобразуем строку ролей
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
          <Button onClick={handleSaveChanges} color="secondary" disabled={!editingUser}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить пользователя</DialogTitle>
        {newUser ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="username"
                  variant="outlined"
                  value={newUser.username}
                  onChange={handleAddChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  variant="outlined"
                  value={newUser.email}
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
          <Button onClick={handleAddUser} color="secondary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UsersPage;
