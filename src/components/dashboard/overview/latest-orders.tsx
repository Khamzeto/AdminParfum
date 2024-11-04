import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';

export interface Review {
  id: string;
  user: { name: string };
  review: string;
  createdAt: Date;
}

export interface LatestOrdersProps {
  orders?: Review[];
  sx?: SxProps;
}

export function LatestOrders({ orders = [], sx }: LatestOrdersProps): React.JSX.Element {
  console.log(orders);
  const router = useRouter(); // Инициализируем useRouter

  const handleViewAllClick = () => {
    router.push('/dashboard/reviews'); // Переход на /dashboard/posts при нажатии
  };
  return (
    <Card sx={sx}>
      <CardHeader title="Последние отзывы" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Отзыв</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow hover key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer?.name || 'Unknown'}</TableCell>
                <TableCell>{dayjs(order.createdAt).format('MMM D, YYYY')}</TableCell>
                <TableCell>{order.review || 'No review content'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={handleViewAllClick}
        >
          Посмотреть все
        </Button>
      </CardActions>
    </Card>
  );
}
