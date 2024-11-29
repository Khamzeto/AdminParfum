import React, { useEffect, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import axios from 'axios';

// Компонент для автозаполнения нот
const NoteSearchAutocomplete = ({ label, selectedNotes, onNotesChange }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]); // Инициализируем как пустой массив
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }

    setLoading(true);

    (async () => {
      try {
        const response = await axios.get(`https://hltback.parfumetrika.ru/notes/search`, {
          params: { query: inputValue },
        });

        if (active) {
          // Устанавливаем options в массив notes из ответа
          setOptions(response.data.notes || []);
        }
      } catch (error) {
        console.error('Ошибка при поиске нот:', error);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [inputValue]);

  return (
    <Autocomplete
      multiple
      id="note-search"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={selectedNotes}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      onChange={(event, newValue) => {
        onNotesChange(newValue); // Обновляем состояние выбранных нот
      }}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default NoteSearchAutocomplete;
