export type Material = 'granite' | 'marble' | 'labradorite' | 'gabbro';
export type Style = 'classic' | 'modern' | 'author';
export type ProductType = 'single' | 'double' | 'svo' | 'complex';

export interface Category {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  image_url: string;
  price_from: string;
  sort_order: number;
}

export interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export interface Product {
  id: number;
  sku: string;
  slug: string;
  name: string;
  material: Material;
  style: Style;
  product_type: ProductType;
  material_label: string;
  price: number;
  image_url: string;
  description: string;
  dimensions: string;
  finish: string;
  featured: boolean;
  category: number | null;
  category_title?: string;
  images?: ProductImage[];
  extra_services?: ExtraService[];
}

export interface Review {
  id: number;
  author: string;
  text: string;
  rating: number;
  image_url: string;
  is_video: boolean;
  sort_order: number;
  created_at?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ReviewCreateRequest {
  text: string;
  rating: number;
  image_url?: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  material: string;
  city: string;
  image_url: string;
  sort_order: number;
}

export interface OfficeLocation {
  id: number;
  city: string;
  slug: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  is_headquarters: boolean;
  is_highlighted: boolean;
  region: 'krasnodar_krai' | 'adygea' | 'other';
  projects_count: number;
  description: string;
}

export interface SiteStats {
  years_experience: number;
  completed_projects: number;
  catalog_count: number;
  cities_count: number;
}

export interface ContentBlock {
  id?: number;
  key: string;
  title: string;
  body: string;
  image_url: string;
  button_label: string;
  button_url: string;
  extra_data: Record<string, unknown>;
  is_enabled?: boolean;
  sort_order: number;
  updated_at?: string;
}

export interface SitePage {
  id?: number;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  is_published?: boolean;
  blocks: ContentBlock[];
  updated_at: string;
}

export interface ExtraService {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface ConsultationRequest {
  id?: number;
  name: string;
  phone: string;
  monument_type?: string;
  material?: string;
  message?: string;
  website?: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartExtraService {
  id: string;
  title: string;
  description: string;
  price: number;
}

export const CART_EXTRA_SERVICES: CartExtraService[] = [
  {
    id: 'consult',
    title: 'Консультация и выезд на кладбище',
    description: 'Выезд специалиста, замеры, подбор материала',
    price: 10000,
  },
  {
    id: 'engraving',
    title: 'Художественная гравировка портрета',
    description: 'Портрет, эпитафия, декоративные элементы',
    price: 45000,
  },
  {
    id: 'install',
    title: 'Установка памятника под ключ',
    description: 'Фундамент, монтаж, выравнивание на месте',
    price: 28000,
  },
  {
    id: 'delivery',
    title: 'Доставка до кладбища',
    description: 'Погрузка и транспортировка по краю',
    price: 12000,
  },
  {
    id: 'fence',
    title: 'Ограда из гранита с монтажом',
    description: 'Изготовление и установка ограды',
    price: 35000,
  },
  {
    id: 'care',
    title: 'Уход за памятником',
    description: 'Мойка и полировка, 1 год обслуживания',
    price: 10000,
  },
  {
    id: 'mosaic',
    title: 'Портретная мозаика',
    description: 'Цветная каменная мозаика по фото',
    price: 62000,
  },
];

export interface ProductFilters {
  material?: Material | '';
  style?: Style | '';
  type?: ProductType | '';
  search?: string;
  featured?: boolean;
}

export const MATERIAL_LABELS: Record<Material, string> = {
  granite: 'Гранит',
  marble: 'Мрамор',
  labradorite: 'Лабрадорит',
  gabbro: 'Габбро',
};

export const STYLE_LABELS: Record<Style, string> = {
  classic: 'Классика',
  modern: 'Минимализм',
  author: 'Авторские',
};

export const TYPE_LABELS: Record<ProductType, string> = {
  single: 'Одиночные',
  double: 'Двойные',
  svo: 'СВО',
  complex: 'Комплексы',
};
