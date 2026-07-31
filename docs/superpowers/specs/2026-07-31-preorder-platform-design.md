# Preorder Website Design

**Status:** Approved design brief  
**Date:** 2026-07-31  
**Purpose:** A small-business preorder website for a baker/seller. Customers browse a controlled catalogue, select predefined product options, choose an order date and fulfilment method, and place orders without exceeding the seller's daily capacity.

## 1. Product Goal

Replace an informal, manual preorder process with a reliable website that helps the owner collect orders and manage capacity. The system must support both pickup and delivery, per-day order limits, and only seller-defined product choices. It must not include a free-form customization field in checkout; customers who want a custom order contact the seller directly by phone/WhatsApp.

The customer has not decided whether final ordering/payment should happen on the website or through WhatsApp. The design deliberately supports both modes, so the business can start with WhatsApp confirmation and later enable a complete web checkout without rebuilding the ordering system.

## 2. Scope

### In scope for version 1

- Public product catalogue with photos, price, description, availability, and seller-defined variants such as size or flavour.
- Persistent cart during a customer session.
- Checkout details: customer name, phone number, fulfilment method, selected preorder date, delivery address when delivery is selected, and a contact consent checkbox.
- Pickup and delivery options.
- Date-specific capacity limits and ordering cutoffs.
- Order creation, status management, and owner/admin management tools.
- Two configurable checkout paths:
  - **Website order:** submit the order to the system.
  - **WhatsApp order:** create a short-lived pending reservation and open WhatsApp with a pre-filled message containing the order reference.
- Automatic expiry of unconfirmed WhatsApp reservations.
- Basic order confirmation/status notifications by WhatsApp link and/or email.
- Secure production deployment, automated testing, and automated deployment from GitHub.

### Explicitly out of scope for version 1

- Customer accounts and order-history login.
- A generic customer comment/customization text field.
- Real-time driver tracking.
- Complex inventory/ingredient management.
- Discount engine, loyalty points, subscriptions, marketplace features, or multi-vendor support.
- Online card/FPX payment until the client confirms a payment provider and business requirements.

## 3. Decisions and Open Configuration

These are business settings, not separate codebases. The owner can choose them in admin settings or deployment configuration.

| Decision | Initial recommendation | Future alternative |
|---|---|---|
| Primary order channel | Hybrid: website order plus optional WhatsApp confirmation | Website-only or WhatsApp-first |
| Payment | Bank transfer/manual confirmation | FPX/card payment gateway |
| Fulfilment | Pickup and delivery | Disable either option per date/product |
| Delivery fee | Fixed fee or simple seller-defined zones | Address/distance-based fee calculation |
| Admin UI | Laravel Filament | Custom Next.js dashboard only if a distinct customer experience justifies it |
| Queue driver | Laravel database queue | Redis queue when notification/background volume grows |
| Image storage | DigitalOcean Spaces | Cloudinary if its image transformations are preferred |

## 4. Recommended Technology Stack

### Customer storefront

- **Next.js (App Router) + React + TypeScript** for the public website.
- **Tailwind CSS** for responsive UI styling.
- A client-side cart state solution appropriate for a small app (React Context or Zustand); the server remains the source of truth for prices, availability, date capacity, and final order totals.
- Server-rendered/public product pages where practical for good performance and SEO.

### Backend and admin

- **Laravel** as a REST API and the owner-facing administration application.
- **Laravel Filament** for the admin dashboard: products, variants, preorder dates, limits, orders, customers, and settings.
- **Laravel Sanctum** for admin authentication. Customers do not need accounts in version 1.
- Laravel Form Requests and Policies for validation and authorization.
- Laravel Scheduler for reservation expiry and other scheduled tasks.
- Laravel notifications/email integration for future status notifications.

### Data and storage

- **PostgreSQL** as the primary relational database.
- **DigitalOcean Spaces** for product images and optional payment-proof uploads; store only the object URL/key in PostgreSQL.
- PostgreSQL is used because reliable transactions and row locking make date-capacity enforcement straightforward. MySQL would also work, but PostgreSQL is the selected database for this project.

### Infrastructure

- **DigitalOcean Droplet** running Docker Compose.
- Containers: Next.js storefront, Laravel API/admin, PostgreSQL, reverse proxy, Laravel scheduler, and Laravel queue worker.
- **Caddy or Nginx** as the reverse proxy and HTTPS termination layer. Caddy is recommended for simpler automatic TLS certificates.
- A DigitalOcean Cloud Firewall allowing only SSH from approved IP addresses and public HTTP/HTTPS traffic.
- Automated backups for the database and Droplet; test restoration before launch.
- A domain with separate routes such as `example.com` for the storefront and `api.example.com` for Laravel API. Filament can live at `api.example.com/admin` or an owner-only `admin.example.com` subdomain.

### Delivery and observability

- GitHub repository and GitHub Actions for CI/CD.
- Docker images stored in GitHub Container Registry (GHCR).
- Application logs written to standard output and collected/rotated by Docker; add an error tracker such as Sentry if budget permits.
- Uptime monitor hitting a health endpoint for both storefront and API.

## 5. System Architecture

```text
Customer browser
  |
  |  Next.js storefront: catalogue, cart, checkout UI
  v
Next.js application
  |
  | HTTPS JSON API requests
  v
Laravel API ------------------------> DigitalOcean Spaces (product images)
  |
  | Laravel admin (Filament)
  v
PostgreSQL <------------------------ Laravel scheduler / queue worker
  |
  +--> products, variants, availability dates, reservations, orders, items, settings

All runtime services run as Docker containers on one DigitalOcean Droplet in version 1.
```

## 6. Customer Journey

### Catalogue to cart

1. The customer visits the storefront, views products, and selects a quantity and only the product options configured by the owner.
2. The storefront shows the server-provided price and availability. It never treats a price calculated only in the browser as authoritative.
3. The customer adds one or more variant selections to the cart.

### Checkout

1. The customer enters their name and phone number.
2. The customer chooses **pickup** or **delivery**.
3. If delivery is chosen, the customer enters the required delivery address fields. The server applies the configured delivery fee/rule.
4. The customer selects an available preorder date. The UI must show closed/full dates as unavailable, but the backend performs the final validation.
5. The customer reviews the server-calculated total and continues with the selected checkout path.

### Website-order path

1. Laravel validates product availability, variant prices, fulfilment details, cutoff time, and remaining capacity.
2. Laravel creates the order within a database transaction.
3. The owner sees the new order as `pending_confirmation` or `awaiting_payment`.
4. The customer receives an order reference and payment/next-step instructions.
5. The owner confirms payment and changes the order status; the customer is notified according to the chosen communication method.

### WhatsApp-order path

1. Laravel validates the same checkout rules and creates an order with status `whatsapp_pending` plus an expiry timestamp.
2. Capacity is temporarily reserved for a short, configurable period (recommended: 20 minutes).
3. The storefront opens WhatsApp with a pre-filled message that includes the order reference, date, total, and fulfilment choice.
4. The owner confirms the order in the admin dashboard after communicating with the customer.
5. If no confirmation happens before expiry, the scheduler marks the reservation expired and restores its capacity. The UI must tell customers that a WhatsApp order is only confirmed after owner confirmation.

## 7. Core Business Rules

1. A product can only be ordered when it is active and the selected variant is active.
2. Product option values are defined by the owner. Checkout accepts option IDs, not arbitrary customer-entered text.
3. A `preorder_date` is orderable only when it is active, not full, and before its configured cutoff timestamp.
4. Pickup and delivery are allowed only when enabled for the selected date/product configuration.
5. A delivery address is mandatory only for delivery orders.
6. Each order gets a human-readable unique order reference.
7. Every final/preliminary checkout is re-priced on Laravel using current server-side product and delivery rules.
8. Capacity must be checked and reserved atomically in PostgreSQL; never rely on the frontend's displayed remaining capacity.
9. When an order is cancelled, rejected, or expires, its reserved capacity is released according to the order-status policy.
10. Custom orders are not collected in checkout. The site offers a WhatsApp/contact link for these requests.

## 8. Capacity-Safe Reservation Design

The daily limit is the most important correctness rule. Two checkouts can happen at almost the same time, so a simple "read remaining capacity, then write order" approach can overbook.

For every order creation or WhatsApp reservation:

1. Begin a PostgreSQL database transaction.
2. Lock the selected availability/date row with `SELECT ... FOR UPDATE` (Laravel: `lockForUpdate()`).
3. Verify that the date is open, before cutoff, and has enough remaining capacity for the order's defined capacity units.
4. Create the order and order items using server-validated data.
5. Increment the date's reserved/confirmed capacity, or derive it from order records while holding the necessary lock.
6. Commit the transaction.

If capacity cannot be reserved, return a clear "This date has just become full; please choose another date" response. The frontend refreshes date availability.

For version 1, define whether capacity is measured as **number of orders** or **number of product units/trays**. The recommended model is a configurable `capacity_units` value per product/variant so a large order can consume more of a day's capacity than a small order.

## 9. Data Model

The database uses Laravel migrations, foreign keys, timestamps, and appropriate indexes. Monetary amounts are stored as integer cents/sen to avoid floating-point errors.

### Main entities

| Table | Purpose | Key fields |
|---|---|---|
| `admins` / `users` | Owner and staff accounts | name, email, password, role, active |
| `products` | Catalogue item | name, slug, description, active, base_price_cents, image_key |
| `product_variants` | Seller-defined size/flavour/options | product_id, name, sku, price_cents, capacity_units, active, sort_order |
| `preorder_dates` | Date-level ordering rules | order_date, cutoff_at, capacity_limit, reserved_capacity, pickup_enabled, delivery_enabled, active |
| `delivery_zones` | Optional simple delivery rules | name, postcode/pattern, fee_cents, active |
| `customers` | Contact record, deduplicated by normalized phone where appropriate | name, phone, email optional |
| `orders` | Checkout/order lifecycle | reference, customer_id, preorder_date_id, fulfilment_method, delivery_address JSON, subtotal_cents, delivery_fee_cents, total_cents, status, expires_at, payment_method, payment_status |
| `order_items` | Snapshot of ordered item data | order_id, product_id, variant_id, product_name, variant_name, unit_price_cents, quantity, capacity_units, line_total_cents |
| `order_status_events` | Auditable status history | order_id, from_status, to_status, actor_id, note, created_at |
| `settings` | Seller-configurable site rules | business name, WhatsApp number, timezone, WhatsApp reservation expiry, default cutoff rules |

### Suggested order statuses

```text
whatsapp_pending -> awaiting_payment -> payment_confirmed -> preparing -> ready -> completed
                         |                  |
                         +-> cancelled <----+

whatsapp_pending -> expired
```

The exact statuses visible to the customer can remain simple. The admin dashboard may use more detailed internal statuses.

## 10. API Boundary

The Next.js app consumes a versioned Laravel JSON API, for example `/api/v1`.

### Public endpoints

- `GET /products` — active catalogue and available variants.
- `GET /preorder-dates` — dates, cutoff state, remaining availability, and supported fulfilment methods.
- `POST /checkout/quote` — validates cart and delivery choice, returns server-calculated totals and date availability.
- `POST /orders` — creates a website order or WhatsApp reservation. The request specifies the checkout channel.
- `GET /orders/{reference}/status` — optional limited customer-facing status lookup using a signed token, not an enumerable public record.

### Admin endpoints / Filament actions

- Product, variant, image, date, capacity, delivery-zone, and settings management.
- Order list and filters by date/status/fulfilment method.
- Order status changes and payment confirmation.
- Manual capacity adjustments with an audit event.
- CSV export of orders for daily preparation.

### API safety requirements

- Validate all inputs using Laravel Form Requests.
- Rate-limit checkout and status lookup endpoints.
- Allow CORS only from the storefront domain(s).
- Use an idempotency key on `POST /orders` so refreshing/retrying cannot create duplicate orders.
- Log relevant order/status actions without logging payment secrets or unnecessary personal data.

## 11. Admin Dashboard Requirements

The owner needs a dashboard that is simple enough to use daily on a phone/tablet or laptop.

- **Today / upcoming orders:** count, capacity used, pickup vs delivery breakdown.
- **Orders:** filterable list with customer contact, date, items, payment state, and clear status actions.
- **Products:** activate/deactivate items, update prices, images, and variants.
- **Preorder calendar:** create available dates, daily limit, cutoff, pickup/delivery availability, and closures.
- **Settings:** business WhatsApp number, pickup instructions, delivery fee/zones, payment instructions, and checkout channel toggle.
- **Export:** downloadable CSV for the selected preorder date.

Admin access must require authentication, use strong passwords, and never be exposed as a public customer feature.

## 12. Deployment Architecture on DigitalOcean

### Initial production topology

One Droplet is appropriate for the first low-traffic client release when its resources are sized after a staging/load check.

Docker Compose services:

- `frontend`: Next.js production server.
- `api`: Laravel PHP-FPM or Laravel Octane only if later performance needs justify it.
- `web`: Nginx/Caddy reverse proxy to route storefront and API/admin traffic.
- `postgres`: PostgreSQL with a named persistent Docker volume.
- `scheduler`: Laravel scheduler container running `schedule:work`.
- `queue`: Laravel queue worker container (database queue initially).

The PostgreSQL port must not be public. Only Docker-internal services may connect to it. Remote access, when required for maintenance, uses SSH tunnelling from an approved administrator machine.

### Domains and HTTPS

- Point `www`/apex domain to the Next.js storefront.
- Point `api` subdomain to Laravel API/admin, or route `/api` and `/admin` behind the same domain as a deliberate configuration.
- Use Caddy/Nginx with automatic Let's Encrypt TLS certificate renewal.
- Redirect HTTP to HTTPS and redirect one canonical hostname to the other.

### Secrets and backups

- Store production environment values in the Droplet's protected deployment environment, not committed `.env` files.
- Required secrets include `APP_KEY`, PostgreSQL credentials, admin bootstrap credentials, mail provider keys, Spaces credentials, WhatsApp/business settings, and any future payment-provider keys.
- Enable automated Droplet backups and schedule logical PostgreSQL backups to a separate protected storage location such as Spaces.
- Document and test a restore procedure before launch and quarterly thereafter.

## 13. CI/CD Pipeline

### Branch policy

- `main` is production-ready and deployable.
- Every feature/fix uses a branch and pull request.
- Pull requests require green CI before merging.

### Continuous integration on every pull request

1. Install exact frontend dependencies using the lockfile.
2. Run frontend linting, unit tests, and a production Next.js build.
3. Install Laravel dependencies.
4. Run Laravel code formatting/linting (Laravel Pint).
5. Run PHPUnit/Pest tests against an ephemeral PostgreSQL service.
6. Run migration checks from a clean database.
7. Optionally run browser-level checkout smoke tests once the initial checkout flow exists.

### Continuous deployment after a merge to `main`

1. GitHub Actions builds immutable Docker images for `frontend` and `api`, tagged with the Git commit SHA.
2. GitHub Actions pushes images to GHCR.
3. The deployment job connects to the Droplet using a dedicated SSH deployment key stored as an encrypted GitHub environment secret.
4. The server pulls the exact SHA-tagged images.
5. Run `php artisan migrate --force` before replacing the API service, after verifying the migration is backwards-compatible with the currently running release.
6. Run `docker compose up -d` to replace application containers while preserving PostgreSQL's volume.
7. Call authenticated/non-sensitive health endpoints for storefront and API.
8. If health checks fail, revert the compose image tags to the previous successful release and restart services; notify the maintainer.

### Required CI/CD secrets

- `GHCR` publishing permissions/token.
- Deployment host, user, SSH private key, and known host fingerprint.
- Production environment values stored on the server or injected through protected GitHub Environment secrets.
- Do not put database passwords, `APP_KEY`, payment keys, or private tokens in Docker images or git history.

## 14. Testing Strategy

### Laravel tests

- Product/variant validation and inactive-product rejection.
- Checkout quote returns server-derived totals.
- Pickup vs delivery required-field validation.
- Cutoff and closed-date rejection.
- Date capacity is correctly reserved by a successful website order.
- Concurrent-order/capacity test ensures only allowed orders can claim the final capacity.
- WhatsApp reservation expires and releases capacity.
- Duplicate request with the same idempotency key creates only one order.
- Admin role protection and unauthorized request rejection.
- Order cancellation/rejection releases capacity when policy requires it.

### Next.js tests

- Cart rendering and variant selection.
- Full/closed preorder dates cannot be selected in the UI.
- Correct fields appear when switching between pickup and delivery.
- Checkout displays server errors clearly, especially a just-filled preorder date.
- WhatsApp mode opens a correctly encoded message only after reservation is created.

### End-to-end smoke tests

- Customer can add a product, choose an allowed date, choose pickup, and submit an order.
- Customer can select delivery and must provide an address.
- Owner can sign in, view the new order, and advance its status.

## 15. Security, Privacy, and Operations

- Collect only data needed to fulfil the order: name, phone, fulfilment details, delivery address where applicable, and order details.
- Serve all traffic over HTTPS.
- Hash admin passwords using Laravel defaults; use rate limiting for login and checkout endpoints.
- Keep customer data out of public URLs and avoid exposing sequential database IDs to customers.
- Restrict SSH access, keep OS/Docker dependencies patched, and renew TLS automatically.
- Include a privacy notice and business contact details appropriate to the client's operating location.
- Define an owner process for cancelling/refunding orders and retaining/deleting old customer data.
- Set uptime checks and a simple alert channel before accepting production orders.

## 16. Implementation Phases

### Phase 1 — Foundation

- Create separate Next.js and Laravel applications/repositories or a documented monorepo.
- Add Docker Compose, local PostgreSQL, baseline CI, environment templates, and API health endpoint.
- Configure DigitalOcean staging/prod infrastructure before collecting real orders.

### Phase 2 — Catalogue and administration

- Build product/variant data model and Filament management screens.
- Implement product catalogue API and Next.js product/cart UI.
- Add Spaces image upload/display.

### Phase 3 — Preorder rules and checkout

- Build preorder date/calendar/capacity administration.
- Implement checkout quote, transaction-safe reservation, order creation, and status events.
- Build pickup/delivery forms and the website-order confirmation page.

### Phase 4 — WhatsApp and manual payment

- Implement optional WhatsApp reservation path, pre-filled message, expiry worker, and owner confirmation flow.
- Add editable bank-transfer/manual payment instructions and payment status actions.

### Phase 5 — Production readiness

- Complete unit/integration/E2E tests for capacity and checkout.
- Configure CI/CD, backups, monitoring, domain, TLS, logging, and rollback procedure.
- Run a staged test order with the client before public launch.

### Phase 6 — Future enhancements only after validation

- Add payment gateway after the client confirms provider, fees, refund process, and payment policy.
- Add customer accounts/order tracking if repeat-customer demand justifies it.
- Add Redis, separate worker services, managed database, or multiple Droplets only after actual load/reliability needs require them.

## 17. Client Decisions Still Needed Before Launch

1. Business name, logo, colours, domain, and product photography.
2. Product list, variants, prices, and whether each variant consumes one or multiple capacity units.
3. Pickup address/instructions and available pickup time windows.
4. Delivery areas, fee model, delivery schedule, and who fulfils delivery.
5. Daily capacity per date and exact preorder cutoff rule.
6. The initial default checkout channel: website, WhatsApp, or hybrid.
7. Bank-transfer/payment instructions and the eventual decision on online payments.
8. WhatsApp business number and owner/staff users who can manage orders.
9. Cancellation/refund and privacy policies.

## 18. Definition of a Successful Version 1

The first release is successful when the owner can independently add products/options, set available dates and daily limits, receive an order from a mobile customer, confirm it, and avoid overbooking. A customer must be able to make a clear pickup/delivery preorder using only seller-defined choices, receive a reference/next step, and be prevented from placing an order for an unavailable or full date.
