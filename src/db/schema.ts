import { pgTable, serial, text, integer, boolean, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  price: integer('price').notNull(),          // FCFA (entier, pas de décimales)
  oldPrice: integer('old_price'),
  description: text('description').notNull().default(''),
  images: text('images').array().notNull().default([]),
  category: text('category').notNull(),
  type: text('type').notNull().default(''),
  needs: text('needs').array().notNull().default([]),
  skinTypes: text('skin_types').array().notNull().default([]),
  zone: text('zone').notNull().default(''),
  ingredients: text('ingredients'),
  usage: text('usage'),
  precautions: text('precautions'),
  inStock: boolean('in_stock').notNull().default(true),
  badge: text('badge'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, t => [index('products_category_idx').on(t.category)]);
export const routines = pgTable('routines', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  steps: text('steps').notNull(),
  productSlugs: text('product_slugs').array().notNull(),
  saving: integer('saving').notNull().default(0),   // économie en FCFA, 0 tant que non définie
  image: text('image'),
  position: integer('position').notNull().default(0),
});
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productSlug: text('product_slug').notNull().references(() => products.slug, { onDelete: 'cascade' }),
  author: text('author'), rating: integer('rating').notNull(), body: text('body').notNull(),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type OrderItem = { slug:string; name:string; price:number; qty:number };
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  ref: text('ref').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  city: text('city').notNull(),
  note: text('note'),
  items: jsonb('items').$type<OrderItem[]>().notNull(),
  total: integer('total').notNull(),          // FCFA, hors livraison
  status: text('status').notNull().default('nouvelle'),
  lang: text('lang').notNull().default('fr'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, t => [index('orders_status_idx').on(t.status)]);
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  kind: text('kind').notNull(),            // commande | produit | routine
  label: text('label').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('staff'),   // admin = tout ; staff = commandes, stock, édition sans suppression
  passwordHash: text('password_hash').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
