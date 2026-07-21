import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CART_EXTRA_SERVICES, CartExtraService, CartItem, Product } from '../models';

const STORAGE_KEY = 'kavkazkamen-cart';
const EXTRAS_STORAGE_KEY = 'kavkazkamen-cart-extras';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly extraServices: CartExtraService[] = CART_EXTRA_SERVICES;

  private readonly itemsSignal = signal<CartItem[]>(this.loadFromStorage());
  private readonly selectedExtrasSignal = signal<string[]>(this.loadExtrasFromStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly selectedExtras = this.selectedExtrasSignal.asReadonly();

  readonly count = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly total = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  readonly extrasTotal = computed(() =>
    this.selectedExtrasSignal().reduce((sum, id) => {
      const service = this.extraServices.find((s) => s.id === id);
      return sum + (service?.price ?? 0);
    }, 0)
  );

  readonly grandTotal = computed(() => this.total() + this.extrasTotal());

  readonly selectedExtraServices = computed(() =>
    this.extraServices.filter((s) => this.selectedExtrasSignal().includes(s.id))
  );

  private readonly itemsSubject = new BehaviorSubject<CartItem[]>(this.itemsSignal());
  readonly items$ = this.itemsSubject.asObservable();

  addItem(product: Product, quantity = 1): void {
    const items = [...this.itemsSignal()];
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    this.updateItems(items);
  }

  removeItem(productId: number): void {
    this.updateItems(this.itemsSignal().filter((i) => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }
    const items = this.itemsSignal().map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    this.updateItems(items);
  }

  toggleExtra(serviceId: string): void {
    const current = this.selectedExtrasSignal();
    const next = current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId];
    this.updateExtras(next);
  }

  isExtraSelected(serviceId: string): boolean {
    return this.selectedExtrasSignal().includes(serviceId);
  }

  clear(): void {
    this.updateItems([]);
    this.updateExtras([]);
  }

  private updateItems(items: CartItem[]): void {
    this.itemsSignal.set(items);
    this.itemsSubject.next(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    if (items.length === 0) {
      this.updateExtras([]);
    }
  }

  private updateExtras(ids: string[]): void {
    this.selectedExtrasSignal.set(ids);
    localStorage.setItem(EXTRAS_STORAGE_KEY, JSON.stringify(ids));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private loadExtrasFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(EXTRAS_STORAGE_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const valid = new Set(this.extraServices.map((s) => s.id));
      return ids.filter((id) => valid.has(id));
    } catch {
      return [];
    }
  }
}
