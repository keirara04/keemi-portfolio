# ninadough — PostgreSQL Schema and Migration Blueprint

**Database:** PostgreSQL 16+  
**Backend:** Laravel 13+  
**Scope:** Complete database plan for the approved ninadough preorder system.

## 1. Schema Rules

- Use `Asia/Kuala_Lumpur` as the business timezone; store timestamps as UTC `timestamptz` and convert only for display.
- Internal keys are Laravel `bigint` IDs. Public records also get a unique `ulid` (26 characters). Never expose sequential IDs to customers.
- Store money as integer sen in `bigint` fields. RM36.00 is `3600`; never use floats.
- Use `varchar` statuses plus Laravel enums/validation, not PostgreSQL native enums, so rules can evolve safely.
- Use `timestampsTz()` on business records; use `softDeletesTz()` only for products, customers, addresses, and delivery zones.
- Snapshot product names, variants, option values, prices, contact details, delivery address, and instructions on an order. History must not change when the owner edits the catalogue.
- A browser cart is not a database table in v1 because customers have no accounts. It is sent to Laravel only at checkout.

## 2. Status Values

`orders.status`: `whatsapp_pending`, `awaiting_payment`, `payment_submitted`, `payment_confirmed`, `preparing`, `ready_for_pickup`, `out_for_delivery`, `completed`, `cancelled`, `rejected`, `expired`.

`orders.payment_status`: `not_required`, `awaiting_payment`, `submitted`, `paid`, `failed`, `refunded`.

`orders.fulfilment_method`: `pickup`, `delivery`.

`orders.checkout_channel`: `website`, `whatsapp`.

## 3. Required v1 Migration Order

| # | Migration file | Table(s) |
|---:|---|---|
| 001 | `create_users_table` | `users` |
| 002 | `create_password_reset_tokens_table` | `password_reset_tokens` |
| 003 | `create_sessions_table` | `sessions` |
| 004 | `create_cache_table` | `cache`, `cache_locks` |
| 005 | `create_jobs_table` | `jobs`, `job_batches`, `failed_jobs` |
| 006 | `create_personal_access_tokens_table` | `personal_access_tokens` |
| 007 | `create_business_settings_table` | `business_settings` |
| 008 | `create_products_table` | `products` |
| 009 | `create_product_images_table` | `product_images` |
| 010 | `create_product_option_groups_table` | `product_option_groups` |
| 011 | `create_product_option_values_table` | `product_option_values` |
| 012 | `create_product_variants_table` | `product_variants` |
| 013 | `create_product_variant_option_values_table` | `product_variant_option_values` |
| 014 | `create_preorder_dates_table` | `preorder_dates` |
| 015 | `create_delivery_zones_table` | `delivery_zones` |
| 016 | `create_delivery_zone_postcodes_table` | `delivery_zone_postcodes` |
| 017 | `create_customers_table` | `customers` |
| 018 | `create_customer_addresses_table` | `customer_addresses` |
| 019 | `create_orders_table` | `orders` |
| 020 | `create_order_items_table` | `order_items` |
| 021 | `create_order_item_option_values_table` | `order_item_option_values` |
| 022 | `create_order_status_events_table` | `order_status_events` |
| 023 | `create_payments_table` | `payments` |
| 024 | `create_payment_proofs_table` | `payment_proofs` |
| 025 | `create_notification_logs_table` | `notification_logs` |
| 026 | `create_activity_logs_table` | `activity_logs` |

## 4. Authentication and Laravel Infrastructure

### `users` — required; admins/staff only

`id`, `ulid` unique, `name` varchar(120), `email` varchar(255) unique/lowercase, `email_verified_at` nullable, `password`, `role` varchar(30) default `owner` (`owner` or `staff`), `is_active` boolean default true, `remember_token`, timestamps.

Indexes: unique `ulid`, unique `email`, index `(is_active, role)`.

### `password_reset_tokens`, `sessions`, `cache`, `cache_locks`

Use Laravel's standard migrations unchanged. Sessions are for Filament/admin login. Cache and cache locks support the database cache driver before Redis is needed.

### `jobs`, `job_batches`, `failed_jobs`

Use Laravel's standard queue migrations. They run WhatsApp-hold expiry, notification retries, and any non-blocking background work.

### `personal_access_tokens`

Use Laravel Sanctum's standard migration. Admins can initially use cookie sessions; retaining this table permits future internal/mobile token use without a schema rewrite.

## 5. Business Settings and Catalogue

### `business_settings`

`id`, `key` varchar(100) unique, `value` jsonb, `is_public` boolean default false, `updated_by_user_id` nullable FK to users with `nullOnDelete`, timestamps.

Required seed keys: `business_name = ninadough`, `timezone = Asia/Kuala_Lumpur`, `whatsapp_number`, `default_whatsapp_reservation_minutes = 20`, `checkout_mode` (`website`, `whatsapp`, `hybrid`), `bank_transfer_instructions`, `pickup_instructions`, `privacy_contact_email`.

### `products`

`id`, `ulid` unique, `name` varchar(160), `slug` varchar(180) unique, `short_description` varchar(500) nullable, `description` text nullable, `base_price_sen` bigint >= 0, `default_capacity_units` integer > 0 default 1, `is_active` boolean true, `is_featured` boolean false, `sort_order` integer default 0, `allergen_information` text nullable, timestamps, soft delete.

Indexes: `(is_active, sort_order)`, `(is_featured, is_active)`.

### `product_images`

`id`, `product_id` FK cascade, `storage_disk` varchar(50), `object_key` varchar(500), `public_url` varchar(1000) nullable, `alt_text` varchar(255) nullable, `sort_order` integer 0, `is_primary` boolean false, timestamps.

Indexes: `(product_id, sort_order)`; add a PostgreSQL partial unique index for one primary image per product. Images live in DigitalOcean Spaces/Cloudinary, never in PostgreSQL blobs.

### `product_option_groups`

`id`, `product_id` FK cascade, `name` varchar(80) e.g. Size/Flavour, `selection_type` varchar(20) default `single`, `is_required` boolean true, `sort_order` integer 0, timestamps.

Constraint/index: unique `(product_id, name)`; index `(product_id, sort_order)`.

### `product_option_values`

`id`, `product_option_group_id` FK cascade, `name` varchar(120), `value_code` varchar(80), `is_active` boolean true, `sort_order` integer 0, timestamps.

Constraint/index: unique `(product_option_group_id, value_code)`; index `(product_option_group_id, is_active, sort_order)`.

### `product_variants`

This is the purchasable product configuration, e.g. a specific cake size/flavour combination.

`id`, `product_id` FK cascade, `sku` varchar(100) nullable/unique, `name` varchar(180), `price_adjustment_sen` bigint default 0, `capacity_units` integer nullable (>0 when supplied), `is_active` boolean true, `sort_order` integer 0, timestamps.

Indexes: `(product_id, is_active, sort_order)`. Server-side final price is `products.base_price_sen + product_variants.price_adjustment_sen`, never client-provided.

### `product_variant_option_values`

Pivot: `product_variant_id` FK cascade, `product_option_value_id` FK restrict delete, timestamps. Unique primary key `(product_variant_id, product_option_value_id)`; reverse index `(product_option_value_id, product_variant_id)`.

Laravel validation must ensure values belong to the same product and one value is selected for every required single-select option group.

## 6. Availability and Delivery

### `preorder_dates`

One configured record per orderable date; this is the row locked during checkout.

`id`, `order_date` date unique, `cutoff_at` timestamptz, `capacity_limit` integer > 0, `reserved_capacity` integer default 0, `pickup_enabled` boolean true, `delivery_enabled` boolean true, `status` varchar(20) default `open` (`open`, `closed`, `full`), `note_internal` varchar(500) nullable, `created_by_user_id` nullable FK users, timestamps.

Indexes: unique `order_date`, `(status, order_date)`. Constraints: `reserved_capacity >= 0`, `reserved_capacity <= capacity_limit`.

### `delivery_zones`

`id`, `name` varchar(120), `description` varchar(500) nullable, `delivery_fee_sen` bigint >= 0, `minimum_order_sen` bigint nullable >= 0, `is_active` boolean true, `sort_order` integer 0, timestamps, soft delete.

Indexes: `(is_active, sort_order)`.

### `delivery_zone_postcodes`

`id`, `delivery_zone_id` FK cascade, `postcode` varchar(20), timestamps. Unique `postcode`; index `(delivery_zone_id, postcode)`.

## 7. Customers and Addresses

### `customers`

Guest customer contact record, not a login account.

`id`, `ulid` unique, `name` varchar(160), `phone_e164` varchar(20) unique, `email` varchar(255) nullable, `marketing_consent_at` nullable, `last_order_at` nullable, timestamps, soft delete.

Indexes: `last_order_at`; email index only if real use demands it. Normalize Malaysian numbers to E.164 before lookup.

### `customer_addresses`

`id`, `customer_id` FK cascade, `label` varchar(60) nullable, `recipient_name` varchar(160), `recipient_phone_e164` varchar(20), `line_1` varchar(255), `line_2` nullable, `city` varchar(120), `state` varchar(120), `postcode` varchar(20), `country_code` char(2) default `MY`, `delivery_zone_id` nullable FK restrict, `is_default` boolean false, timestamps, soft delete.

Indexes: `(customer_id, is_default)`, `postcode`. Add a partial unique index for one default address per customer if desired.

## 8. Orders, Capacity Holds, and History

### `orders`

The central order record. A WhatsApp reservation is an order where `status = whatsapp_pending`; do **not** create a duplicate `reservations` table.

`id`, `ulid` unique, `order_number` varchar(40) unique, `customer_id` FK restrict, `preorder_date_id` FK restrict, `checkout_channel` varchar(20), `fulfilment_method` varchar(20), `delivery_zone_id` nullable FK restrict, `customer_name_snapshot`, `customer_phone_snapshot`, `customer_email_snapshot` nullable, `delivery_address` jsonb nullable, `pickup_instruction_snapshot` text nullable, `subtotal_sen`, `delivery_fee_sen`, `discount_sen` default 0, `total_sen`, `total_capacity_units` integer > 0, `status`, `payment_status`, `payment_method` nullable, `expires_at` nullable, `capacity_released_at` nullable, `confirmed_at` nullable, `paid_at` nullable, `completed_at` nullable, `idempotency_key` char(36) unique, `source_metadata` jsonb nullable, timestamps.

Indexes: `(preorder_date_id, status)`, `(preorder_date_id, fulfilment_method, status)`, `(customer_id, created_at desc)`, `(status, expires_at)`, `(payment_status, created_at desc)`, `(checkout_channel, created_at desc)`.

Rules: delivery requires `delivery_address` and `delivery_zone_id`; pickup requires both null. `whatsapp_pending` requires `expires_at`. All money fields are non-negative.

### `order_items`

Immutable line-item snapshot.

`id`, `order_id` FK cascade, `product_id` nullable FK nullOnDelete, `product_variant_id` nullable FK nullOnDelete, `product_name_snapshot` varchar(160), `variant_name_snapshot` nullable, `sku_snapshot` nullable, `unit_price_sen` bigint >= 0, `quantity` integer > 0, `capacity_units_each` integer > 0, `line_total_sen` bigint >= 0, `sort_order` integer 0, timestamps.

Index: `(order_id, sort_order)`.

### `order_item_option_values`

`id`, `order_item_id` FK cascade, `option_group_name_snapshot` varchar(80), `option_value_name_snapshot` varchar(120), `sort_order` integer 0, timestamps.

Index: `(order_item_id, sort_order)`.

### `order_status_events`

Append-only lifecycle audit.

`id`, `order_id` FK, `from_status` nullable, `to_status`, `actor_type` varchar(20) (`user`/`system`), `actor_user_id` nullable FK users, `note_internal` nullable, `metadata` jsonb nullable, `created_at`. No `updated_at`.

Indexes: `(order_id, created_at)`, `(to_status, created_at)`, `(actor_user_id, created_at)`.

### Safe capacity transaction

For every website order or WhatsApp reservation:

1. Start a PostgreSQL transaction.
2. Lock one `preorder_dates` record using Laravel `lockForUpdate()`.
3. Verify it is open, before cutoff, supports fulfilment method, and `reserved_capacity + requested_capacity <= capacity_limit`.
4. Create/find `customers`, then create `orders`, `order_items`, `order_item_option_values`, and initial `order_status_events` from server-validated data.
5. Increment `preorder_dates.reserved_capacity` by `orders.total_capacity_units`.
6. Commit.

For `cancelled`, `rejected`, and `expired`: lock the same date, decrement capacity only when `capacity_released_at IS NULL`, set `capacity_released_at`, create an event, then commit. This prevents duplicate release on retry.

## 9. Payments, Notifications, and Auditing

### `payments`

Manual payments must be recorded independently from an order status so the system is auditable and ready for an FPX/card provider.

`id`, `ulid` unique, `order_id` FK restrict, `method` varchar(30) (`bank_transfer`, `cash_on_pickup`, future `fpx`/`card`), `provider` nullable, `provider_reference` nullable, `amount_sen` bigint > 0, `currency` char(3) default `MYR`, `status` (`pending`, `submitted`, `confirmed`, `failed`, `refunded`), `paid_at` nullable, `confirmed_by_user_id` nullable FK users, `gateway_payload` jsonb nullable/redacted, timestamps.

Indexes: `(order_id, created_at)`, `(provider, provider_reference)`, `(status, created_at)`.

### `payment_proofs`

Only used if bank-transfer screenshots are uploaded on the website. If proof remains in WhatsApp, leave this table unused.

`id`, `payment_id` FK cascade, `storage_disk`, `object_key`, `mime_type`, `size_bytes`, `uploaded_at`, `reviewed_at` nullable, `reviewed_by_user_id` nullable FK users, `review_note_internal` nullable, timestamps.

Indexes: `(payment_id, uploaded_at)`, `reviewed_at`. Store private object keys; never publish proof images.

### `notification_logs`

`id`, `order_id` nullable FK nullOnDelete, `customer_id` nullable FK nullOnDelete, `channel` (`email`, `whatsapp_link`, future `whatsapp_api`, `sms`), `template_key`, `recipient`, `status` (`queued`, `sent`, `failed`, `skipped`), `provider_message_id` nullable, `error_message` nullable, `sent_at` nullable, timestamps.

Indexes: `(order_id, created_at)`, `(status, created_at)`, `(channel, created_at)`.

### `activity_logs`

Admin audit trail for price, capacity, availability, and order changes.

`id`, `actor_user_id` nullable FK users, `event` varchar(120), `subject_type` varchar(120), `subject_id` bigint nullable, `before` jsonb nullable, `after` jsonb nullable, `ip_address` inet nullable, `created_at`. No `updated_at`.

Indexes: `(subject_type, subject_id, created_at)`, `(actor_user_id, created_at)`, `(event, created_at)`.

## 10. Optional Future Migrations — Do Not Create in v1

| Future migration | Table(s) | Add only when |
|---|---|---|
| `create_preorder_date_product_settings_table` | `preorder_date_product_settings` | Specific products need date-specific availability, pricing, or capacity. |
| `create_inventory_tables` | `inventory_lots`, `inventory_movements` | Ingredient/stock tracking becomes a real requirement. |
| `create_promotions_tables` | `promotions`, `promotion_redemptions` | Client approves coupons or discounts. |
| `create_customer_account_tables` | customer authentication records | Customer accounts/order history are approved. |
| `create_payment_webhook_events_table` | `payment_webhook_events` | FPX/card gateway webhooks need idempotent event storage. |
| `create_refunds_table` | `refunds` | Gateway refunds are introduced. |
| `create_delivery_assignments_table` | `drivers`, `delivery_assignments` | The business assigns riders or tracks delivery handoff. |
| `create_message_conversations_tables` | conversation/message records | Actual two-way WhatsApp Business API inbox is adopted. |
| `create_daily_sales_snapshots_table` | `daily_sales_snapshots` | Reporting is too slow for live queries. |

## 11. Tables Intentionally Excluded from v1

- `carts`, `cart_items`: guest browser cart is enough.
- `reservations`: `orders` with `whatsapp_pending` is the reservation source of truth.
- `custom_requests`, `order_comments`: client does not allow a free-text customisation field; special requests go to WhatsApp.
- `stock`, `inventory`: daily preorder capacity is the agreed constraint, not ingredient management.
- `categories`: add only if the real catalogue genuinely needs category navigation.
- `coupons`, `reviews`, `wishlists`, `loyalty_points`: outside approved MVP scope.

## 12. Required Development Seeders

1. `OwnerUserSeeder` — development/staging owner; never commit real production credentials.
2. `BusinessSettingsSeeder` — ninadough name, timezone, placeholder checkout/payment/pickup values.
3. `ProductSeeder` — sample products, images, option groups, values, and variants.
4. `PreorderDateSeeder` — future open/full/closed dates for UI and capacity tests.
5. `DeliveryZoneSeeder` — fictional zones/postcodes/fees for development only.
6. `OrderDemoSeeder` — non-personal sample orders in every lifecycle status.

## 13. Migration Verification Checklist

1. Run all migrations against a new PostgreSQL database.
2. Run `php artisan migrate:fresh --seed` in non-production.
3. Confirm every FK has the intended delete behaviour; historic orders must retain snapshots even when a product is removed.
4. Confirm unique keys: public ULIDs, `order_number`, `orders.idempotency_key`, `customers.phone_e164`, `preorder_dates.order_date`, and product slug.
5. Test concurrent checkout: only the allowed number of orders can claim the final available capacity.
6. Test WhatsApp expiry: capacity is released exactly once.
7. Back up and restore PostgreSQL to a separate environment, then validate object-storage keys for images/proofs.
