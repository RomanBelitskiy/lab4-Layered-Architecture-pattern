/** Application Layer: бізнес-логіка меню + кеш для продуктивності (QA Performance). */

const CACHE_TTL_MS = 60_000;

export class MenuService {
  constructor(menuRepository) {
    this._repo = menuRepository;
    this._cacheItems = null;
    this._cacheExpiry = 0;
  }

  invalidateCache() {
    this._cacheItems = null;
    this._cacheExpiry = 0;
  }

  listItemsForClient() {
    const now = Date.now();
    if (this._cacheItems && now < this._cacheExpiry) {
      return { items: this._cacheItems };
    }
    const items = this._repo.findAll().map((i) => ({ ...i }));
    this._cacheItems = items;
    this._cacheExpiry = now + CACHE_TTL_MS;
    return { items };
  }

  getItem(itemId) {
    const item = this._repo.findById(itemId);
    return item;
  }

  validateMenuItemAvailable(itemId) {
    const full = this._repo.findByIdIncludingUnavailable(itemId);
    if (!full) return { ok: false, reason: 'not_found' };
    if (!full.available) return { ok: false, reason: 'unavailable' };
    return { ok: true, item: full };
  }
}
