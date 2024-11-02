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

interface Brand {
  _id: string;
  original: string;
  slug: string;
}

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteBrandId, setDeleteBrandId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  // Состояния для редактирования бренда
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<{
    newName: string;
    newSlug?: string;
    _id: string;
  } | null>(null);

  // Состояния для добавления бренда
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [newBrand, setNewBrand] = useState<Brand | null>(null);

  // Параметры пагинации
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchBrands = async () => {
    setLoading(true);
    setBrands([]); // Сбрасываем предыдущие бренды перед новым запросом
    try {
      const response = await axios.get('https://hltback.parfumetrika.ru/brands/searchBrands', {
        params: {
          query: searchQuery || 'a',
          page,
          limit: itemsPerPage,
        },
      });

      if (response.data.brands.length === 0) {
        setBrands([]); // Устанавливаем пустой массив, если бренды не найдены
      } else {
        setBrands(response.data.brands); // Если бренды найдены, устанавливаем их
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      setBrands([]); // Если произошла ошибка, сбрасываем бренды
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
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
    if (selected.length === 0 && !deleteBrandId) {
      return;
    }

    try {
      if (deleteBrandId) {
        await axios.delete(`https://hltback.parfumetrika.ru/brands/brands/${deleteBrandId}`);
      } else {
        await Promise.all(selected.map((id) => axios.delete(`https://hltback.parfumetrika.ru/brands/${id}`)));
      }
      fetchBrands();
      setSelected([]);
      setDeleteBrandId(null);
    } catch (error) {
      console.error('Ошибка при удалении брендов:', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteIconClick = (id: string) => {
    setDeleteBrandId(id);
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

  const handleEditClick = async (brand_id: string) => {
    setOpenEditDialog(true);
    setEditingBrand(null);
    try {
      const response = await axios.get(`https://hltback.parfumetrika.ru/brands/id/${brand_id}`);
      setEditingBrand({
        newName: response.data.original,
        newSlug: response.data.slug,
        _id: response.data._id,
      });
    } catch (error) {
      console.error('Ошибка при получении данных бренда:', error);
      setOpenEditDialog(false);
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (editingBrand) {
      const { name, value } = event.target;
      setEditingBrand({
        ...editingBrand,
        [name as string]: value,
      });
    }
  };

  const handleSaveChanges = async () => {
    if (editingBrand) {
      try {
        await axios.put(`https://hltback.parfumetrika.ru/brands/brands/${editingBrand._id}`, {
          newName: editingBrand.newName,
          newSlug: editingBrand.newSlug,
        });
        setOpenEditDialog(false);
        fetchBrands();
      } catch (error) {
        console.error('Ошибка при сохранении изменений:', error);
      }
    }
  };

  const handleAddClick = () => {
    setNewBrand({
      _id: '',
      original: '',
      slug: '',
    });
    setOpenAddDialog(true);
  };

  const handleAddChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (newBrand) {
      const { name, value } = event.target;
      setNewBrand({
        ...newBrand,
        [name as string]: value,
      });
    }
  };

  const handleAddBrand = async () => {
    if (newBrand) {
      try {
        await axios.post('https://hltback.parfumetrika.ru/brands/create', {
          original: newBrand.original,
        });
        setOpenAddDialog(false);
        fetchBrands();
      } catch (error) {
        console.error('Ошибка при добавлении бренда:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Бренды
      </Typography>

      <form style={{ marginTop: '30px' }} onSubmit={handleSearchSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              name="search"
              label="Поиск брендов"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>
      </form>

      <Box display="flex" gap={2} style={{ marginTop: '20px' }}>
        <Button variant="contained" color="primary" startIcon={<Plus size={20} />} onClick={handleAddClick}>
          Добавить бренд
        </Button>

        <Button
          variant="contained"
          color="secondary"
          disabled={selected.length === 0}
          onClick={() => setOpenDeleteDialog(true)}
        >
          Удалить выбранные бренды
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
                  <TableCell>Slug</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(brands) && brands.length > 0 ? (
                  brands.map((brand) => (
                    <TableRow key={brand._id} selected={isSelected(brand._id)}>
                      <TableCell>{brand.original}</TableCell>
                      <TableCell>{brand.slug}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" aria-label="edit" onClick={() => handleEditClick(brand._id)}>
                          <PencilSimple size={20} />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          aria-label="delete"
                          onClick={() => handleDeleteIconClick(brand._id)}
                        >
                          <Trash size={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {loading ? 'Загрузка...' : 'Бренды не найдены'}
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
        <DialogTitle>Удалить бренд</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите удалить выбранные бренды?</DialogContentText>
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
        <DialogTitle>Редактировать бренд</DialogTitle>
        {editingBrand ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Новое название"
                  name="newName"
                  variant="outlined"
                  value={editingBrand.newName}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Slug"
                  name="newSlug"
                  variant="outlined"
                  value={editingBrand.newSlug || ''}
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
          <Button onClick={handleSaveChanges} color="secondary" disabled={!editingBrand}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить бренд</DialogTitle>
        {newBrand ? (
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название"
                  name="original"
                  variant="outlined"
                  value={newBrand.original}
                  onChange={handleAddChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Slug"
                  name="slug"
                  variant="outlined"
                  value={newBrand.slug || ''}
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
          <Button onClick={handleAddBrand} color="secondary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BrandsPage;
