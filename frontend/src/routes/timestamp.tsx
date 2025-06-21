import { createFileRoute } from '@tanstack/react-router';
import TimestampPageComponent from '../plugins/timestamp';

export const Route = createFileRoute('/timestamp')({
  component: TimestampPageComponent,
});
