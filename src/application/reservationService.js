/** Application Layer: резерви */

import crypto from 'node:crypto';

const MAX_NOTE_LEN = 500;
const MAX_NAME_LEN = 120;

export class ReservationService {
  constructor(reservationRepo) {
    this._repo = reservationRepo;
  }

  create(input) {
    const guestCount = Number(input.guestCount);
    const durationMinutes = Number(input.durationMinutes);
    const contactPhone = String(input.contactPhone ?? '').trim();
    const contactName = String(input.contactName ?? '').trim();

    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 50) {
      throw Object.assign(new Error('Некоректний guestCount (1-50).'), { status: 400 });
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes < 30 || durationMinutes > 300) {
      throw Object.assign(new Error('Некоректний durationMinutes (30-300).'), { status: 400 });
    }
    if (!contactPhone || contactPhone.length > 20) {
      throw Object.assign(new Error('Некоректний контактний телефон.'), { status: 400 });
    }
    if (!contactName || contactName.length > MAX_NAME_LEN) {
      throw Object.assign(new Error('Некоректне імʼя контакту.'), { status: 400 });
    }
    const startAt = new Date(input.startAt);
    if (Number.isNaN(startAt.getTime())) {
      throw Object.assign(new Error('Некоректний формат поля startAt.'), { status: 400 });
    }
    let notes = input.notes != null ? String(input.notes).trim() : '';
    if (notes.length > MAX_NOTE_LEN) notes = notes.slice(0, MAX_NOTE_LEN);

    const id = crypto.randomUUID();
    const row = {
      id,
      status: 'pending_confirmation',
      guestCount,
      startAt: startAt.toISOString(),
      durationMinutes,
      tableId: null,
      contactPhone,
      contactName,
      notes,
      message:
        'Запит прийнято. Очікуйте підтвердження від адміністратора залу.',
    };

    return this._repo.save(row);
  }

  getById(id) {
    return this._repo.findById(id);
  }
}
