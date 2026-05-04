/** Data Layer: доступ до зберігання меню (в пам'ять для лабораторної). */

const seed = [
  {
    id: 'mi-uuid-001',
    name: 'Борщ',
    description: 'Традиційний червоний борщ',
    priceUah: 120,
    preparationMinutes: 25,
    category: 'first_course',
    available: true,
    allergens: ['gluten'],
  },
  {
    id: 'mi-uuid-002',
    name: 'Салат Цезар',
    description: 'Курка, салат, соус',
    priceUah: 145,
    preparationMinutes: 15,
    category: 'salad',
    available: true,
    allergens: ['dairy', 'gluten'],
  },
];

export class MenuRepository {
  constructor() {
    this._items = new Map(seed.map((i) => [i.id, { ...i }]));
  }

  findAll() {
    return [...this._items.values()].filter((i) => i.available);
  }

  findById(id) {
    const item = this._items.get(id);
    if (!item || !item.available) return null;
    return { ...item };
  }

  findByIdIncludingUnavailable(id) {
    const item = this._items.get(id);
    return item ? { ...item } : null;
  }
}
