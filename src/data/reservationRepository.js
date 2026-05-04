/** Data Layer: резерви столиків */

export class ReservationRepository {
  constructor() {
    this._rows = new Map();
  }

  save(reservation) {
    this._rows.set(reservation.id, { ...reservation });
    return reservation;
  }

  findById(id) {
    const r = this._rows.get(id);
    return r ? { ...r } : null;
  }
}
