/** Допустимі переходи статусів замовлення (надійність, консистентність даних). */
export const ORDER_STATUS = {
  ACCEPTED: 'accepted',
  COOKING: 'cooking',
  READY_FOR_PICKUP: 'ready_for_pickup',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const KITCHEN_TRANSITIONS = {
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.COOKING],
  [ORDER_STATUS.COOKING]: [ORDER_STATUS.READY_FOR_PICKUP],
};

export function canKitchenTransition(from, to) {
  const allowed = KITCHEN_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}
