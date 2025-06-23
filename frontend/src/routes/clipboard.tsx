import { createFileRoute } from '@tanstack/react-router';
import ClipboardApp from '../plugins/clipboard/index';

export const Route = createFileRoute('/clipboard')({
  component: ClipboardApp,
});