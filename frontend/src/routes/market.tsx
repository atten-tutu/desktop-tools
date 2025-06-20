import { createFileRoute } from '@tanstack/react-router';
import AppMarketPlugin from '../plugins/market/index';

export const Route = createFileRoute('/market')({
  component: AppMarketPlugin,
});
