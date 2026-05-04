import express from 'express';

export function createOrderRoutes(orderService) {
  const router = express.Router();

  router.post('/', (req, res, next) => {
    try {
      const idemKey = req.get('Idempotency-Key') || req.get('idempotency-key');
      const order = orderService.createOrder(req.body || {}, idemKey);
      return res.status(201).json(order);
    } catch (e) {
      return next(e);
    }
  });

  router.get('/:orderId', (req, res, next) => {
    try {
      const order = orderService.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: 'Замовлення не знайдено.' });
      }
      return res.json(order);
    } catch (e) {
      return next(e);
    }
  });

  router.post('/:orderId/payments', (req, res, next) => {
    try {
      const method = req.body?.method;
      const result = orderService.pay(req.params.orderId, method);
      return res.status(201).json(result);
    } catch (e) {
      return next(e);
    }
  });

  return router;
}
