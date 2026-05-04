/** Data Layer: замовлення та ідемпотентні ключі */

export class OrderRepository {
  constructor() {
    this._orders = new Map();
    /** @type {Map<string, string>} idempotencyKey -> orderId */
    this._idempotency = new Map();
  }

  saveOrder(order) {
    this._orders.set(order.id, { ...order });
    return order;
  }

  findById(id) {
    const o = this._orders.get(id);
    return o ? { ...o } : null;
  }

  getIdempotencyOrderId(key) {
    if (!key) return null;
    return this._idempotency.get(key) ?? null;
  }

  bindIdempotency(key, orderId) {
    if (key) this._idempotency.set(key, orderId);
  }
}
