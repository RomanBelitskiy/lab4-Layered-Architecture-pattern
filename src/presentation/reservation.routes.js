import express from 'express';

export function createReservationRoutes(reservationService) {
  const router = express.Router();

  router.post('/', (req, res, next) => {
    try {
      const row = reservationService.create(req.body || {});
      return res.status(201).json(row);
    } catch (e) {
      return next(e);
    }
  });

  router.get('/:reservationId', (req, res, next) => {
    try {
      const row = reservationService.getById(req.params.reservationId);
      if (!row) {
        return res.status(404).json({ message: 'Резерв з таким id не знайдено.' });
      }
      return res.json(row);
    } catch (e) {
      return next(e);
    }
  });

  return router;
}
