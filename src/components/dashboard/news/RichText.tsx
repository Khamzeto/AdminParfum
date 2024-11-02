import { useRef } from 'react'; // Используем useRef для управления input
import { Button } from '@mantine/core'; // Используем Button из Mantine
import { Link, RichTextEditor } from '@mantine/tiptap';
import { IconUpload } from '@tabler/icons-react'; // Импорт иконки загрузки
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import SubScript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import '@mantine/tiptap/styles.css';

interface RichTextProps {
  setContent: (content: string) => void;
}

export default function RichText({ setContent }: RichTextProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image, // Подключаем Image
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null); // Используем реф для input

  // Обработчик загрузки изображений
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        editor?.commands.setImage({ src: base64Image }); // Добавляем изображение в редактор
      };
      reader.readAsDataURL(file);
    }
  };

  // Открываем диалог выбора файла при клике на кнопку
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <RichTextEditor style={{ borderRadius: '14px', padding: '8px' }} editor={editor}>
      <RichTextEditor.Toolbar sticky stickyOffset={60}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>

        {/* Поле для загрузки изображений */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef} // Привязываем реф к input
          style={{ display: 'none' }}
        />

        {/* Красивая кнопка для загрузки изображения */}
        <Button
          onClick={handleButtonClick}
          variant="outline"
          color="#cfcfcf"
          radius="4"
          w="30px" // Ширина кнопки
          h="26px" // Высота кнопки
          styles={() => ({
            root: {
              display: 'flex',
              justifyContent: 'center', // Центрируем по горизонтали
              alignItems: 'center', // Центрируем по вертикали
              padding: '0', // Убираем внутренние отступы
            },
          })}
        >
          <IconUpload size={14} color="black" /> {/* Иконка будет по центру кнопки */}
        </Button>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content pt="0" />
    </RichTextEditor>
  );
}
