/** Application Layer: замовлення, оплата, ідемпотентність POST (QA Reliability) */

import crypto from 'node:crypto';
import { ORDER_STATUS, canKitchenTransition } from '../domain/orderStatus.js';

export class OrderService {
  constructor(orderRepo, menuService) {
    this._repo = orderRepo;
    this._menu = menuService;
  }

  createOrder(payload, idempotencyKey) {
    if (idempotencyKey) {
      const existingId = this._repo.getIdempotencyOrderId(idempotencyKey);
      if (existingId) {
        const existing = this._repo.findById(existingId);
        if (existing) return existing;
      }
    }

    const type = payload.type;
    if (!['delivery', 'dine_in', 'takeaway'].includes(type)) {
      throw Object.assign(new Error('Поле type має бути delivery | dine_in | takeaway.'), {
        status: 400,
      });
    }

    const items = payload.items;
    if (!Array.isArray(items) || items.length === 0) {
      throw Object.assign(new Error('Масив items не може бути порожнім.'), { status: 400 });
    }

    const lineTotals = [];
    let totalUah = 0;
    for (const line of items) {
      const q = Number(line.quantity);
      if (!Number.isInteger(q) || q < 1) {
        throw Object.assign(new Error('Некоректна quantity для позиції.'), { status: 400 });
      }
      const check = this._menu.validateMenuItemAvailable(line.menuItemId);
      if (!check.ok) {
        const msg =
          check.reason === 'not_found'
            ? `Позицію меню ${line.menuItemId} не знайдено.`
            : `Позиція меню ${line.menuItemId} наразі недоступна.`;
        throw Object.assign(new Error(msg), { status: 409, menuItemId: line.menuItemId });
      }
      const lineSum = Math.round(check.item.priceUah * q * 100) / 100;
      totalUah += lineSum;
      lineTotals.push({
        menuItemId: line.menuItemId,
        name: check.item.name,
        quantity: q,
        lineTotalUah: lineSum,
      });
    }

    if (type === 'delivery') {
      const addr = payload.deliveryAddress;
      const city = addr?.city ? String(addr.city).trim() : '';
      if (city !== 'Київ') {
        throw Object.assign(new Error('Доставка за вказаною адресою недоступна (поза зоною демо).'), {
          status: 422,
        });
      }
    }

    const id = crypto.randomUUID();
    const order = {
      id,
      type,
      status: ORDER_STATUS.ACCEPTED,
      paymentStatus: 'unpaid',
      totalUah: Math.round(totalUah * 100) / 100,
      items: lineTotals,
      reservationId: payload.reservationId ?? null,
      deliveryAddress: type === 'delivery' ? payload.deliveryAddress : null,
      contactPhone: payload.contactPhone ?? null,
      scheduledAt: payload.scheduledAt ?? null,
      createdAt: new Date().toISOString(),
    };

    this._repo.saveOrder(order);
    if (idempotencyKey) this._repo.bindIdempotency(idempotencyKey, id);
    return order;
  }

  getOrder(id) {
    return this._repo.findById(id);
  }

  pay(orderId, method) {
    const order = this._repo.findById(orderId);
    if (!order) {
      throw Object.assign(new Error('Замовлення не знайдено.'), { status: 404 });
    }
    if (order.paymentStatus === 'paid') {
      throw Object.assign(new Error('Замовлення вже оплачене.'), { status: 409 });
    }
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw Object.assign(new Error('Неможливо оплатити скасоване замовлення.'), { status: 422 });
    }
    if (!method || String(method).length > 20) {
      throw Object.assign(new Error('Некоректний method оплати.'), { status: 400 });
    }

    order.paymentStatus = 'paid';
    order.paymentMethod = String(method);
    this._repo.saveOrder(order);

    return {
      paymentId: crypto.randomUUID(),
      orderId: order.id,
      status: 'succeeded',
      message: 'Оплату успішно зареєстровано (демо-бекенд).',
    };
  }

  patchKitchenStatus(orderId, nextStatus) {
    const order = this._repo.findById(orderId);
    if (!order) {
      throw Object.assign(new Error('Замовлення не знайдено.'), { status: 404 });
    }
    const from = order.status;
    if (!canKitchenTransition(from, nextStatus)) {
      throw Object.assign(new Error(`Некоректний перехід статусу з "${from}" до "${nextStatus}".`), {
        status: 409,
      });
    }
    order.status = nextStatus;
    this._repo.saveOrder(order);
    return order;
  }
}
