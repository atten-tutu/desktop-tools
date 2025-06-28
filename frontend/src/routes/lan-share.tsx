import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LanSharePlugin from '../plugins/lan_share';
import { LanShareProvider } from '../plugins/lan_share/context/LanShareContext';

export const Route = createFileRoute('/lan-share')({
  component: LanSharePage,
});

function LanSharePage() {
  return (
    <LanShareProvider>
      <LanSharePlugin />
    </LanShareProvider>
  );
}