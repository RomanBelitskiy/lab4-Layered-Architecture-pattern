/** Presentation Layer: HTTP, лише транспорт до Application */

import express from 'express';

export function createMenuRouter(menuService) {
  const router = express.Router();

  router.get('/items', (_req, res, next) => {
    try {
      const data = menuService.listItemsForClient();
      res.setHeader('Cache-Control', 'private, max-age=30');
      res.json(data);
    } catch (e) {
      next(e);
    }
  });

  router.get('/items/:itemId', (req, res, next) => {
    try {
      const item = menuService.getItem(req.params.itemId);
      if (!item) {
        return res.status(404).json({
          message: `Позицію меню з id '${req.params.itemId}' не знайдено.`,
        });
      }
      return res.json(item);
    } catch (e) {
      return next(e);
    }
  });

  return router;
}
