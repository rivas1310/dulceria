'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import GestionCupones from '@/components/admin/cupones/GestionCupones';

export default function CuponesPage() {
  return (
    <Box p={4}>
      <GestionCupones />
    </Box>
  );
} 