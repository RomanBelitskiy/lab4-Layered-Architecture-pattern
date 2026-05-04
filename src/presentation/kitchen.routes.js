import express from 'express';
import { ORDER_STATUS } from '../domain/orderStatus.js';

export function createKitchenRoutes(orderService) {
  const router = express.Router();

  router.patch('/orders/:orderId/status', (req, res, next) => {
    try {
      const status = req.body?.status;
      if (!status) {
        return res.status(400).json({ message: 'Поле status обовʼязкове.' });
      }
      if (
        ![ORDER_STATUS.COOKING, ORDER_STATUS.READY_FOR_PICKUP].includes(status)
      ) {
        return res.status(400).json({
          message: 'Неприпустиме значення status для кухні.',
        });
      }
      const order = orderService.patchKitchenStatus(req.params.orderId, status);
      return res.json(order);
    } catch (e) {
      return next(e);
    }
  });

  return router;
}
