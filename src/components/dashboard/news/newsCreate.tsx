'use client';

import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  Notification,
  rem,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconUpload, IconX } from '@tabler/icons-react';
import axios from 'axios';

import RichText from './RichText';

export default function NewsCreation() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null); // For storing cover image
  const [notification, setNotification] = useState<{
    message: string;
    color: string;
    icon: React.ReactNode;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;
  const checkIcon = <IconCheck style={{ width: rem(20), height: rem(20) }} />;

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file); // Convert image to base64
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !content) {
      setNotification({ message: 'Please fill in all fields.', color: 'red', icon: xIcon });
      return;
    }

    setLoading(true);

    try {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        const user = JSON.parse(storedUser);

        // Make the POST request using axios
        const response = await axios.post('https://hltback.parfumetrika.ru/news/requests', {
          title,
          description,
          content,
          coverImage, // Add cover image if exists
          userId: user.id, // Send userId from local storage
        });

        setNotification({
          message: response.data.message || 'News successfully submitted!',
          color: 'teal',
          icon: checkIcon,
        });
      } else {
        setNotification({ message: 'User not found.', color: 'red', icon: xIcon });
      }
    } catch (error) {
      console.error('Error submitting news:', error);
      setNotification({ message: 'Error submitting news.', color: 'red', icon: xIcon });
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Open file selection dialog
    }
  };

  return (
    <>
      <Container fluid maw="1440px" style={{ margin: '60px auto 0 auto' }} mt="20">
        {/* Notification */}
        {notification && (
          <Notification
            icon={notification.icon}
            color={notification.color}
            title={notification.color === 'red' ? 'Error' : 'Success'}
            mb="lg"
            radius="14"
          >
            {notification.message}
          </Notification>
        )}

        {/* Card wraps the content */}
        <Card shadow="sm" padding="lg" radius="16">
          <Box mb="lg">
            <Text size="lg" mb="md">
              Create News Post
            </Text>

            {/* Title Input */}
            <TextInput
              label="Title"
              placeholder="Enter news title"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              required
              mb="md"
            />

            {/* Description Textarea */}
            <Textarea
              label="Description"
              placeholder="Enter a brief description of the news"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              required
              mb="md"
              minRows={3}
            />

            {/* Image Upload */}
            <Text size="sm" mb="xs">
              News Cover Image
            </Text>
            <Button
              variant="outline"
              leftSection={<IconUpload size={16} />}
              onClick={handleButtonClick}
              radius="md"
              fullWidth
              mb="md"
            >
              Upload Cover Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {/* Cover Image Preview */}
            {coverImage && (
              <Group>
                <Image src={coverImage} alt="News Cover" radius="md" height={200} width={320} fit="cover" mb="md" />
              </Group>
            )}
          </Box>
          {/* Rich Text Editor */}
          <Text style={{ fontSize: '14px', fontWeight: 500 }} mb="xs">
            Content
          </Text>
          <RichText setContent={setContent} /> {/* Pass setContent function */}
          {/* Submit Button */}
          <Button
            fullWidth
            mt="md"
            radius="md"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading} // Disable button during loading
          >
            Submit News
          </Button>
        </Card>
      </Container>
    </>
  );
}
