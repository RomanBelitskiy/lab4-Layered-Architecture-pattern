import express from 'express';
import crypto from 'node:crypto';

import { MenuRepository } from '../data/menuRepository.js';
import { ReservationRepository } from '../data/reservationRepository.js';
import { OrderRepository } from '../data/orderRepository.js';
import { MenuService } from '../application/menuService.js';
import { ReservationService } from '../application/reservationService.js';
import { OrderService } from '../application/orderService.js';
import { createMenuRouter } from './menu.routes.js';
import { createReservationRoutes } from './reservation.routes.js';
import { createOrderRoutes } from './order.routes.js';
import { createKitchenRoutes } from './kitchen.routes.js';

/** Composition root + Presentation: Express, QA Observability */

export function createApp() {
  const menuRepo = new MenuRepository();
  const reservationRepo = new ReservationRepository();
  const orderRepo = new OrderRepository();

  const menuService = new MenuService(menuRepo);
  const reservationService = new ReservationService(reservationRepo);
  const orderService = new OrderService(orderRepo, menuService);

  const app = express();

  app.use(express.json({ limit: '64kb' }));

  app.use((req, res, next) => {
    const rid = req.get('X-Request-Id') || crypto.randomUUID();
    req.requestId = rid;
    res.setHeader('X-Request-Id', rid);
    next();
  });

  app.use((req, res, next) => {
    const t0 = Date.now();
    res.on('finish', () => {
      console.log(
        JSON.stringify({
          requestId: req.requestId,
          method: req.method,
          path: req.originalUrl.split('?')[0],
          status: res.statusCode,
          ms: Date.now() - t0,
        }),
      );
    });
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/', (_req, res) => {
    res.json({
      message: 'Restaurant API lab-4.',
      hints: {
        health: 'GET /health',
        menu: 'GET /api/v1/menu/items',
      },
    });
  });

  app.get('/favicon.ico', (_req, res) => {
    res.status(204).end();
  });

  app.use('/api/v1/menu', createMenuRouter(menuService));
  app.use('/api/v1/reservations', createReservationRoutes(reservationService));
  app.use('/api/v1/orders', createOrderRoutes(orderService));
  app.use('/api/v1/kitchen', createKitchenRoutes(orderService));

  app.use((_req, res) => {
    res.status(404).json({ message: 'Ресурс не знайдено.' });
  });

  app.use((err, req, res, _next) => {
    const status = err.status && Number(err.status) >= 400 ? err.status : 500;
    const body = {
      message: err.message || 'Внутрішня помилка сервера.',
    };
    if (err.menuItemId) body.menuItemId = err.menuItemId;
    if (req.requestId) body.requestId = req.requestId;
    res.status(status).json(body);
  });

  return app;
}
