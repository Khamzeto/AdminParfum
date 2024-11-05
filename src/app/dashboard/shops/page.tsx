'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, Container, Grid, TextField, Typography } from '@mui/material';
import axios from 'axios';

interface Shop {
  _id: string;
  name: string;
  url: string;
  location: string;
  rating: number;
  image: string;
}

const ShopManager: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [form, setForm] = useState({
    name: '',
    url: '',
    location: '',
    rating: '',
    image: '',
  });
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await axios.get('https://hltback.parfumetrika.ru/shops');
      setShops(response.data);
    } catch (error) {
      console.error('Ошибка при получении магазинов:', error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    try {
      let base64Image = form.image;

      if (imageFile) {
        base64Image = await toBase64(imageFile);
      }

      const payload = { ...form, image: base64Image };

      if (editingShopId) {
        await axios.put(`https://hltback.parfumetrika.ru/shops/${editingShopId}`, payload);
      } else {
        await axios.post('https://hltback.parfumetrika.ru/shops', payload);
      }

      setForm({ name: '', url: '', location: '', rating: '', image: '' });
      setImageFile(null);
      setEditingShopId(null);
      fetchShops();
    } catch (error) {
      console.error('Ошибка при сохранении магазина:', error);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleEdit = (shop: Shop) => {
    setEditingShopId(shop._id);
    setForm({
      name: shop.name,
      url: shop.url,
      location: shop.location,
      rating: shop.rating.toString(),
      image: shop.image,
    });
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://hltback.parfumetrika.ru/shops/${id}`);
      fetchShops();
    } catch (error) {
      console.error('Ошибка при удалении магазина:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Управление Магазинами
      </Typography>
      <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Название" name="name" value={form.name} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="URL" name="url" value={form.url} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Местоположение"
              name="location"
              value={form.location}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Рейтинг"
              name="rating"
              type="number"
              value={form.rating}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              Выберите изображение
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>
            {imageFile && (
              <Typography variant="body2" color="textSecondary">
                Файл: {imageFile.name}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {editingShopId ? 'Обновить магазин' : 'Создать магазин'}
            </Button>
            {editingShopId && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setForm({ name: '', url: '', location: '', rating: '', image: '' });
                  setEditingShopId(null);
                  setImageFile(null);
                }}
                sx={{ ml: 2 }}
              >
                Отменить
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        {shops.map((shop) => (
          <Grid item xs={12} sm={6} md={4} key={shop._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{shop.name}</Typography>
                <Typography color="textSecondary">{shop.location}</Typography>
                <Typography>Рейтинг: {shop.rating}</Typography>
                {shop.image && (
                  <img src={shop.image} alt={shop.name} style={{ width: '100%', height: 'auto', marginTop: '10px' }} />
                )}
              </CardContent>
              <CardActions>
                <Button color="primary" onClick={() => handleEdit(shop)}>
                  Редактировать
                </Button>
                <Button color="secondary" onClick={() => handleDelete(shop._id)}>
                  Удалить
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ShopManager;
