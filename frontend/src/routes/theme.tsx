import { createFileRoute } from '@tanstack/react-router';
import ThemeApp from '../plugins/theme/index';

export const Route = createFileRoute('/theme')({
  component: ThemeApp,
});
