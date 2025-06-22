// src/routes/upload.tsx
import { createFileRoute } from '@tanstack/react-router';
import PluginUploadPage from '../plugins/market/upload';

export const Route = createFileRoute('/upload')({
  component: PluginUploadPage,
});
