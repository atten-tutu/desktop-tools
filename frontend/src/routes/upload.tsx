import { createFileRoute } from '@tanstack/react-router';
import uploadApp from '../plugins/upload/index';

export const Route = createFileRoute('/upload')({
  component: uploadApp,
});