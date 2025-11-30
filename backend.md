```markdown
# Backend Implementation Guide: PWA E-commerce Integrated with POS

**Version: 1.0**
**Date: May 22, 2025**

## ⚠️ DEPLOYMENT DIRECTIVE
**IMPORTANT: Backend code is in the `/server` directory. When deploying to Railway, use:**
```bash
cd /server && railway up
```
**DO NOT deploy from the root directory. The `/server` folder contains the NestJS backend, Prisma migrations, and Railway configuration.**

## 1. Document Header

(Included above)

## 2. API Design

This section outlines the key API endpoints the PWA frontend will interact with, and describes the backend's interaction patterns with the external POS API.

### 2.1. Frontend-Facing API Endpoints

These are RESTful API endpoints exposed by our new backend for the PWA.

| Endpoint                  | Method | Description                                                                 | Request Body (Example)                                                                 | Response Body (Example)                                                                                                |
| :------------------------ | :----- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| `/auth/register`          | `POST` | Register a new client/user. Creates user locally and optionally in POS.     | `{ "email": "...", "password": "...", "name": "...", "phone": "..." }`                 | `{ "token": "...", "user": { ... } }` or `{ "error": "..." }`                                                        |
| `/auth/login`             | `POST` | Authenticate a user and provide a JWT.                                      | `{ "email": "...", "password": "..." }`                                              | `{ "token": "...", "user": { ... } }` or `{ "error": "..." }`                                                        |
| `/auth/me`                | `GET`  | Get details of the currently authenticated user.                            | (None, requires Auth Header)                                                           | `{ "user": { "id": ..., "name": "...", "email": "...", ... } }` or `{ "error": "Unauthorized" }`                      |
| `/products`               | `GET`  | Get a list of available products (with filtering/pagination options).         | (Query Params: `branch_id`, `category`, `search`, `page`, `limit`)                     | `{ "products": [ { ... }, ... ], "total": ... }`                                                                       |
| `/products/{id}`          | `GET`  | Get details for a specific product.                                         | (Path Param: `id`)                                                                     | `{ "product": { "id": ..., "name": "...", "price": ..., ... } }` or `{ "error": "Not Found" }`                       |
| `/branches`               | `GET`  | Get a list of all branches with location data.                              | (None)                                                                                 | `{ "branches": [ { "id": ..., "name": "...", "address": "...", "latitude": ..., "longitude": ... }, ... ] }`         |
| `/cart`                   | `GET`  | Get the current user's cart contents.                                       | (None, requires Auth Header)                                                           | `{ "cart": { "items": [ { "product_id": ..., "quantity": ..., "price": ... }, ... ], "subtotal": ... } }`             |
| `/cart/add`               | `POST` | Add a product to the cart or update quantity if exists.                     | `{ "product_id": ..., "quantity": ... }` (requires Auth Header)                        | `{ "cart": { ... } }` or `{ "error": "..." }`                                                                        |
| `/cart/update/{item_id}`  | `PUT`  | Update the quantity of a specific item in the cart.                         | `{ "quantity": ... }` (requires Auth Header, Path Param: `item_id`)                    | `{ "cart": { ... } }` or `{ "error": "..." }`                                                                        |
| `/cart/remove/{item_id}`  | `DELETE`| Remove a specific item from the cart.                                       | (None, requires Auth Header, Path Param: `item_id`)                                    | `{ "cart": { ... } }` or `{ "error": "..." }`                                                                        |
| `/orders`                 | `POST` | Create a new order from the cart.                                           | `{ "branch_id": ..., "order_type": "delivery"/"pickup", "delivery_address": { ... }, "notes": "..." }` (requires Auth Header) | `{ "order": { "id": ..., "status": "pending", "total_amount": ..., ... } }` or `{ "error": "..." }`               |
| `/orders`                 | `GET`  | Get a list of the current user's orders.                                    | (None, requires Auth Header, Query Params: `status`, `page`, `limit`)                  | `{ "orders": [ { ... }, ... ], "total": ... }`                                                                       |
| `/orders/{id}`            | `GET`  | Get details for a specific order.                                           | (Path Param: `id`, requires Auth Header)                                               | `{ "order": { "id": ..., "status": ..., "items": [...], ... } }` or `{ "error": "Not Found" }`                       |
| `/notifications`          | `GET`  | Get a list of the current user's notifications.                             | (None, requires Auth Header, Query Params: `read_status`, `page`, `limit`)             | `{ "notifications": [ { "id": ..., "title": "...", "message": "...", "read_status": false, ... }, ... ] }`           |
| `/notifications/{id}/read`| `PUT`  | Mark a notification as read.                                                | (None, requires Auth Header, Path Param: `id`)                                         | `{ "notification": { ... } }` or `{ "error": "Not Found" }`                                                          |
| `/delivery-fee`           | `POST` | Calculate estimated delivery fee for an address and branch.                 | `{ "branch_id": ..., "delivery_address": { "latitude": ..., "longitude": ... } }`     | `{ "estimated_fee": ..., "distance_km": ... }` or `{ "error": "..." }`                                             |

*(Note: Real-time order status updates and notifications might also use WebSockets, which are not covered in this REST API list but should be part of the implementation).*

### 2.2. Backend-to-POS API Interactions

The backend will communicate with the external POS API. The exact endpoints and methods depend on the POS system's API documentation (to be provided), but typical interactions will include:

*   **Fetch Products & Stock:**
    *   Endpoint: `/api/pos/products` (example)
    *   Method: `GET`
    *   Purpose: Periodically sync product data (name, description, price, stock quantity) from POS. This might be a single endpoint or require per-branch calls.
*   **Fetch Clients:**
    *   Endpoint: `/api/pos/clients` (example)
    *   Method: `GET`
    *   Purpose: Sync existing client data from POS.
*   **Create Client (if needed):**
    *   Endpoint: `/api/pos/clients` (example)
    *   Method: `POST`
    *   Purpose: Create a new client in the POS when a new user registers in our PWA.
*   **Send Order:**
    *   Endpoint: `/api/pos/orders` (example)
    *   Method: `POST`
    *   Purpose: Submit a completed order from the PWA to the POS for processing by the designated branch.
*   **Get Order Status (Optional Polling):**
    *   Endpoint: `/api/pos/orders/{pos_order_id}` (example)
    *   Method: `GET`
    *   Purpose: Check the status of an order in the POS. This is an alternative/complement to POS webhooks for tracking status changes.
*   **POS API Authentication:** The backend must handle authentication with the POS API (e.g., API keys, OAuth tokens).

## 3. Data Models

These are the core database models required for the backend.

*   **User (or Client)**
    *   `id` (UUID/INT, Primary Key)
    *   `pos_client_id` (INT/VARCHAR, nullable - link to POS client ID)
    *   `email` (VARCHAR, Unique)
    *   `password_hash` (VARCHAR)
    *   `name` (VARCHAR)
    *   `phone` (VARCHAR, nullable)
    *   `address` (JSON/TEXT, nullable - default delivery address)
    *   `latitude` (DECIMAL, nullable - for default address)
    *   `longitude` (DECIMAL, nullable - for default address)
    *   `created_at` (TIMESTAMP)
    *   `updated_at` (TIMESTAMP)

*   **Branch**
    *   `id` (UUID/INT, Primary Key)
    *   `pos_branch_id` (INT/VARCHAR, Unique - link to POS branch ID)
    *   `name` (VARCHAR)
    *   `address` (VARCHAR)
    *   `latitude` (DECIMAL)
    *   `longitude` (DECIMAL)
    *   `phone` (VARCHAR, nullable)
    *   `operating_hours` (JSON/TEXT, nullable)
    *   `created_at` (TIMESTAMP)
    *   `updated_at` (TIMESTAMP)

*   **Product**
    *   `id` (UUID/INT, Primary Key)
    *   `pos_product_id` (INT/VARCHAR - link to POS product ID)
    *   `pos_branch_id` (INT/VARCHAR - link to POS branch ID, if stock/price is per branch)
    *   `name` (VARCHAR)
    *   `description` (TEXT, nullable)
    *   `base_price` (DECIMAL - price fetched from POS)
    *   `override_price` (DECIMAL, nullable - price override set in backend)
    *   `current_price` (DECIMAL - calculated: `override_price` if not null, else `base_price`)
    *   `stock_quantity` (INT - quantity fetched from POS)
    *   `image_url` (VARCHAR, nullable)
    *   `category` (VARCHAR, nullable)
    *   `is_active` (BOOLEAN - determines if shown on PWA)
    *   `created_at` (TIMESTAMP)
    *   `updated_at` (TIMESTAMP)
    *   `pos_last_synced_at` (TIMESTAMP)

*   **Cart**
    *   `id` (UUID/INT, Primary Key)
    *   `user_id` (UUID/INT, Foreign Key -> User)
    *   `created_at` (TIMESTAMP)
    *   `updated_at` (TIMESTAMP)

*   **CartItem**
    *   `id` (UUID/INT, Primary Key)
    *   `cart_id` (UUID/INT, Foreign Key -> Cart)
    *   `product_id` (UUID/INT, Foreign Key -> Product - links to our local product)
    *   `quantity` (INT)
    *   `price_at_add` (DECIMAL - snapshot of `current_price` when added to cart)
    *   `created_at` (TIMESTAMP)
    *   `updated_at` (TIMESTAMP)

*   **Order**
    *   `id` (UUID/INT, Primary Key)
    *   `user_id` (UUID/INT, Foreign Key -> User)
    *   `pos_order_id` (INT/VARCHAR, nullable - ID assigned by POS after submission)
    *   `branch_id` (UUID/INT, Foreign Key -> Branch - branch fulfilling the order)
    *   `order_type` (ENUM/VARCHAR - 'delivery', 'pickup')
    *   `status` (ENUM/VARCHAR - e.g., 'pending', 'sent_to_pos', 'processing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'failed')
    *   `subtotal` (DECIMAL)
    *   `delivery_fee` (DECIMAL)
    *   `total_amount` (DECIMAL - `subtotal` + `delivery_fee`)
    *   `delivery_address` (JSON/TEXT, nullable - snapshot of delivery address)
    *   `delivery_latitude` (DECIMAL, nullable)
    *   `delivery_longitude` (DECIMAL, nullable)
    *   `notes` (TEXT, nullable)
    *   `created_at` (TIMESTAMP)
    *   `updated_at` (TIMESTAMP)
    *   `pos_sent_at` (TIMESTAMP, nullable)
    *   `pos_last_status_update_at` (TIMESTAMP, nullable)

*   **OrderItem**
    *   `id` (UUID/INT, Primary Key)
    *   `order_id` (UUID/INT, Foreign Key -> Order)
    *   `product_id` (UUID/INT, Foreign Key -> Product - links to our local product)
    *   `pos_product_id` (INT/VARCHAR - snapshot of POS product ID)
    *   `name` (VARCHAR - snapshot of product name)
    *   `quantity` (INT)
    *   `unit_price` (DECIMAL - snapshot of price)
    *   `total_price` (DECIMAL - `quantity` * `unit_price`)

*   **Notification**
    *   `id` (UUID/INT, Primary Key)
    *   `user_id` (UUID/INT, Foreign Key -> User)
    *   `type` (ENUM/VARCHAR - e.g., 'order_status', 'promo', 'system')
    *   `title` (VARCHAR)
    *   `message` (TEXT)
    *   `order_id` (UUID/INT, Foreign Key -> Order, nullable)
    *   `read_status` (BOOLEAN, default FALSE)
    *   `created_at` (TIMESTAMP)

## 4. Business Logic

This section describes the core processes and rules implemented in the backend.

*   **POS Data Synchronization:**
    *   **Products & Stock:** Implement a scheduled job (e.g., daily, hourly, or even more frequent depending on POS API limits and desired real-time accuracy) to fetch product data (including stock levels) from the POS API.
        *   Map POS product IDs and branch IDs to our local `Product` model.
        *   Update existing products, add new ones, and mark products as inactive (`is_active = FALSE`) if they are no longer in the POS feed or have zero stock *and* a configuration specifies they should be hidden.
        *   Handle product updates carefully, especially `base_price`. If a product has an `override_price` set in our system, the PWA should display the `override_price`, but the POS synchronization should still update the `base_price` and `stock_quantity`.
        *   Sync should ideally be incremental (fetch only changes since last sync) if the POS API supports it. Otherwise, full sync requires matching and updating/inserting/deleting.
    *   **Clients:** Sync existing POS clients upon initial setup or registration flow. Link them to our `User` model via `pos_client_id`. When a new user registers via PWA, create the user locally and then call the POS API to create the corresponding client in POS, storing the returned `pos_client_id`. Handle potential duplicates or conflicts.
    *   **Branches:** Fetch branch information (ID, name, address, location) from the POS API during initial setup or periodic sync if branch details can change. Store this in the `Branch` table.

*   **Product Presentation:**
    *   The `/products` and `/products/{id}` endpoints should serve data from our local `Product` table.
    *   The price displayed should be the `current_price` (override if available, otherwise base).
    *   Product availability is determined by `is_active` and `stock_quantity` (consider how zero stock should be displayed/handled). Products should potentially be filtered by the user's selected branch if stock is branch-specific.

*   **Cart Management:**
    *   Standard add, update, remove logic.
    *   Cart items are linked to the logged-in `User`.
    *   When adding an item, record the product's `current_price` at that moment in `CartItem.price_at_add`.

*   **Branch Selection and Location-Based Routing:**
    *   When the user selects delivery, the PWA should get the user's location or delivery address coordinates.
    *   The backend (or PWA) calculates the distance from this location to each active `Branch` using the Haversine formula or equivalent.
    *   Based on configuration:
        *   Automatically suggest or route the order to the nearest branch that stocks all items in the cart (if stock is per-branch).
        *   Allow the user to manually select a branch for pickup or delivery from a list, potentially ordered by distance.
    *   Validate that the selected branch is operational and suitable for the requested order type.

*   **Delivery Fee Calculation:**
    *   The `/delivery-fee` endpoint and the order placement logic (`POST /orders`) will calculate the fee based on the delivery distance (calculated between the selected branch's coordinates and the delivery address coordinates).
    *   **Logic:**
        *   If distance <= 2 km: Fee = 99 UAH.
        *   If distance > 2 km AND distance <= 3 km: Fee = 99 UAH. (Assuming the fee only increases *beyond* 3km based on the rule "if more than 3 km every km costs +30 uah").
        *   If distance > 3 km: Fee = 99 UAH + (`distance_in_km` - 3) * 30 UAH.
        *   If order type is 'pickup': Fee = 0 UAH.
    *   Distance calculation should be accurate (e.g., Haversine). Rounding might be needed for distance or fee calculation as per business preference.

*   **Order Placement (`POST /orders`):**
    *   Validate user, cart contents, selected branch, order type, and delivery details (address, location).
    *   Perform final stock check against the selected branch's stock (ideally locking stock in POS if API supports it).
    *   Calculate final `subtotal` from cart items' `price_at_add`.
    *   Calculate final `delivery_fee` using the logic above.
    *   Calculate `total_amount`.
    *   Create a local `Order` record with `status` 'pending'. Store order details, items (snapshotting product data), delivery info, and calculated fees.
    *   Call the POS API to submit the order payload. This call should happen asynchronously (e.g., put job on a queue) to avoid blocking the user's request if the POS API is slow or down.
    *   Handle POS API response:
        *   If successful: Update local `Order` status to 'sent_to_pos' (or similar), store `pos_order_id`, clear the user's `Cart`. Trigger a notification for the user ("Order Confirmed").
        *   If failed: Update local `Order` status to 'failed', log the error, potentially notify the user ("Order Failed"). Implement retry logic for sending to POS.

*   **Order Status Tracking:**
    *   Track order status changes. This can be done via:
        *   **Polling:** Periodically query the POS API for status updates on open orders. Update local `Order.status` and trigger notifications based on changes.
        *   **Webhooks (Preferred):** If the POS API supports webhooks, configure it to send updates to an endpoint on our backend when an order status changes in POS. This allows for real-time updates.
    *   Based on status changes (e.g., 'processing', 'ready_for_pickup', 'out_for_delivery', 'delivered'), trigger user notifications.

*   **Notifications:**
    *   Implement a notification system (e.g., database table).
    *   Trigger notifications for key events: Order confirmation, Order status updates, delivery driver assigned (if applicable and supported by POS), etc.
    *   Use WebSockets (e.g., Socket.IO, WebSockets built into framework) to push notifications to the connected PWA client in real-time.
    *   Store notifications in the `Notification` table for users to view historical notifications.

## 5. Security

*   **Authentication:**
    *   Implement token-based authentication (JWT - JSON Web Tokens recommended) for PWA users.
    *   Users authenticate via `/auth/login` with email/password.
    *   Upon successful login, issue a short-lived access token and a longer-lived refresh token.
    *   The access token is sent with subsequent requests in the `Authorization: Bearer <token>` header.
    *   Implement token validation on protected endpoints.
    *   Secure password storage using strong hashing algorithms (e.g., bcrypt).

*   **Authorization:**
    *   Implement middleware to protect endpoints based on authentication status.
    *   Implement checks to ensure users can only access or modify *their own* data (cart, orders, profile, notifications). E.g., when fetching `/orders/{id}`, verify that the order's `user_id` matches the authenticated user's ID.
    *   If an admin interface is built later, implement role-based access control (RBAC) to restrict access to administrative functions (like product overrides, sync triggers).

*   **POS API Security:**
    *   Store POS API credentials (API keys, secrets, tokens) securely using environment variables or a secrets management system. Do not hardcode credentials.
    *   All communication with the POS API must use HTTPS.
    *   If the POS API uses OAuth, implement the correct OAuth flow on the backend.

*   **Input Validation and Sanitization:**
    *   Strictly validate and sanitize all incoming data from the PWA to prevent common vulnerabilities (SQL injection, XSS, mass assignment). Use libraries/framework features for this.

*   **HTTPS Everywhere:**
    *   Ensure the backend API is served over HTTPS. This protects data in transit between the PWA and the backend.

*   **Rate Limiting:**
    *   Implement rate limiting on key endpoints (e.g., login, registration, order creation) to mitigate brute-force attacks and denial-of-service attempts.

*   **Data Protection:**
    *   Encrypt sensitive data at rest if required by compliance or risk assessment (e.g., full credit card details - though ideally handled by a payment gateway).
    *   Secure database access credentials and restrict network access to the database server.

## 6. Performance

*   **Database Optimizations:**
    *   Create indexes on commonly queried fields (`user_id` on Cart, Order, Notification; `product_id` on CartItem, OrderItem; `pos_client_id`, `pos_product_id`, `pos_branch_id` for sync lookups; `branch_id` on Order).
    *   Use appropriate database types (e.g., DECIMAL for currency, TIMESTAMP for dates, spatial types like PostGIS for location data).
    *   Optimize database queries, avoid N+1 problems.
    *   Consider connection pooling.

*   **Caching:**
    *   Implement caching for data that doesn't change frequently (e.g., branch list, static product details that don't have active overrides or stock).
    *   Cache user session data or JWT verification results.
    *   Use an in-memory cache like Redis or Memcached.

*   **Asynchronous Processing:**
    *   Use message queues (e.g., RabbitMQ, Kafka, Redis Queue) or background job processors for tasks that don't require immediate response:
        *   Sending orders to the POS API.
        *   POS data synchronization jobs.
        *   Sending emails or other notifications (besides real-time push).
    *   This prevents slow POS API responses from blocking user requests and improves the perceived performance of the PWA.

*   **Efficient POS Synchronization:**
    *   Implement logic to perform delta updates from the POS API if supported.
    *   Avoid unnecessary updates during sync. Only update records if data has actually changed.

*   **Distance Calculation:**
    *   If using a relational database, consider a spatial extension (like PostGIS for PostgreSQL) for efficient calculation of distances and nearest neighbors, especially if the number of branches or locations grows large.

*   **Pagination and Filtering:**
    *   Implement pagination and filtering on list endpoints (`/products`, `/orders`, `/notifications`) to avoid transferring large amounts of data.

*   **Real-time Notifications:**
    *   Use an efficient technology like WebSockets for pushing notifications to the PWA, rather than relying solely on the PWA polling the backend.

## 7. Code Examples

Here are simplified examples for key logic components using a conceptual framework (syntax might vary based on chosen language/framework like Node.js/Express, Python/Django/Flask, PHP/Laravel, etc.).

### 7.1. Distance Calculation (Haversine Formula)

This calculates the distance in kilometers between two sets of latitude and longitude coordinates.

```javascript
// Example using JavaScript/Node.js
import { point, distance } from '@turf/turf'; // Install turf.js for robust geo calculations

/**
 * Calculates the distance between two geographic coordinates using Turf.js.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const from = point([lon1, lat1]);
  const to = point([lon2, lat2]);
  // distance unit defaults to kilometers in turf.js
  return distance(from, to);
}

// Example Usage:
const branchLat = 50.4501; // Example Kyiv coordinates
const branchLon = 30.5234;
const deliveryLat = 50.4600; // Example nearby location
const deliveryLon = 30.5300;

const dist = calculateDistanceKm(branchLat, branchLon, deliveryLat, deliveryLon);
console.log(`Distance: ${dist.toFixed(2)} km`); // Output: Distance: X.XX km
```

*(Note: Using a library like Turf.js or a spatial database function is recommended over implementing Haversine manually for accuracy and robustness).*

### 7.2. Delivery Fee Calculation

This function applies the specified business logic for delivery fees.

```javascript
/**
 * Calculates the delivery fee based on distance.
 * Rules: <= 2km costs 99 UAH. > 3km costs 99 UAH + (distance - 3) * 30 UAH.
 * Assuming 2km < distance <= 3km also costs 99 UAH.
 * @param {number} distanceKm Distance in kilometers
 * @returns {number} Delivery fee in UAH
 */
function calculateDeliveryFee(distanceKm) {
  const BASE_FEE = 99; // UAH
  const BASE_DISTANCE_KM = 2; // km for base fee
  const EXTRA_CHARGE_START_KM = 3; // km where extra charge begins
  const EXTRA_CHARGE_PER_KM = 30; // UAH

  if (distanceKm <= BASE_DISTANCE_KM) {
    return BASE_FEE;
  } else if (distanceKm > EXTRA_CHARGE_START_KM) {
    // Ensure distanceKm is treated as a number and handle potential floating point issues if necessary
    const extraDistance = distanceKm - EXTRA_CHARGE_START_KM;
    // Round extra distance up to the nearest km if required by business logic,
    // based on "every km costs +30". Assuming full km blocks for extra charge.
    const extraFee = Math.ceil(extraDistance) * EXTRA_CHARGE_PER_KM; // Charge for every *part* of a km beyond 3? Or only full km? Let's assume ceil for charging.
    // If the rule means (distanceKm - 3) * 30 for the exact distance, use: const extraFee = extraDistance * EXTRA_CHARGE_PER_KM;
    return BASE_FEE + extraFee;
  } else { // distanceKm > 2 and <= 3
    // As per interpretation of the rules provided
    return BASE_FEE;
  }
}

// Example Usages:
console.log(`Fee for 1.5 km: ${calculateDeliveryFee(1.5)} UAH`); // Output: 99 UAH
console.log(`Fee for 2.0 km: ${calculateDeliveryFee(2.0)} UAH`); // Output: 99 UAH
console.log(`Fee for 2.5 km: ${calculateDeliveryFee(2.5)} UAH`); // Output: 99 UAH (based on interpretation)
console.log(`Fee for 3.0 km: ${calculateDeliveryFee(3.0)} UAH`); // Output: 99 UAH (based on interpretation)
console.log(`Fee for 3.1 km: ${calculateDeliveryFee(3.1)} UAH`); // Output: 99 + ceil(0.1)*30 = 99 + 30 = 129 UAH
console.log(`Fee for 4.0 km: ${calculateDeliveryFee(4.0)} UAH`); // Output: 99 + ceil(1.0)*30 = 99 + 30 = 129 UAH
console.log(`Fee for 4.5 km: ${calculateDeliveryFee(4.5)} UAH`); // Output: 99 + ceil(1.5)*30 = 99 + 60 = 159 UAH
console.log(`Fee for 5.0 km: ${calculateDeliveryFee(5.0)} UAH`); // Output: 99 + ceil(2.0)*30 = 99 + 60 = 159 UAH

// Note: Clarify with business stakeholder if the "every km" charge beyond 3km
// means per full km block or based on the exact decimal distance. Math.ceil()
// implements charging for any part of a kilometer beyond the threshold.
```

### 7.3. POS Order Submission (Conceptual)

This demonstrates the backend calling the POS API. This would typically be done in a background job or asynchronously.

```javascript
// Example using Node.js with axios (conceptual)
import axios from 'axios';
// Assume config has POS_API_URL and POS_API_KEY
import config from '../config';

/**
 * Submits a validated order to the external POS API.
 * This function should ideally be called from a background job.
 * @param {object} orderData - Data representing the order, formatted for the POS API.
 *                             Includes branch_id, client_id, items, delivery_info, etc.
 * @returns {Promise<object>} - Resolves with POS response on success, rejects on failure.
 */
async function sendOrderToPos(orderData) {
  const posOrderPayload = {
    // Map our orderData model to the expected POS API payload structure
    branch_pos_id: orderData.branch.pos_branch_id, // Use POS branch ID
    client_pos_id: orderData.user.pos_client_id,   // Use POS client ID
    order_type: orderData.order_type,
    items: orderData.items.map(item => ({
      pos_product_id: item.pos_product_id, // Use POS product ID
      quantity: item.quantity,
      price: item.unit_price, // Use the price sent in the order
      name: item.name // Include name snapshot for POS if needed
    })),
    delivery_address: orderData.delivery_address,
    delivery_fee: orderData.delivery_fee,
    total_amount: orderData.total_amount,
    notes: orderData.notes,
    // Include any other fields required by the POS API
    our_order_id: orderData.id // Send our internal ID for tracking/correlation
  };

  try {
    const response = await axios.post(`${config.POS_API_URL}/api/pos/orders`, posOrderPayload, {
      headers: {
        'Authorization': `Bearer ${config.POS_API_KEY}`, // Or whatever auth POS requires
        'Content-Type': 'application/json'
      },
      timeout: 10000 // Set a timeout for the POS API call
    });

    if (response.status >= 200 && response.status < 300) {
      console.log(`Order sent successfully to POS. POS Order ID: ${response.data.pos_order_id}`);
      return response.data; // Assuming POS API returns details including its own order ID
    } else {
      console.error(`POS API returned error status: ${response.status}`, response.data);
      throw new Error(`POS API error: ${response.status}`);
    }

  } catch (error) {
    console.error('Failed to send order to POS:', error.message);
    // Log the full error details, potentially including response.data if available
    if (error.response) {
        console.error('POS API response data:', error.response.data);
        console.error('POS API response status:', error.response.status);
    } else if (error.request) {
        console.error('No response received from POS API');
    }
    throw error; // Re-throw to be caught by the background job handler
  }
}

// --- In the order placement logic (simplified) ---
async function placeOrder(userId, orderDetails) {
    // ... (validation, cart fetching, fee calculation, create local Order record) ...

    const newOrder = await db.Order.create({ ...orderDetails, status: 'pending' });

    try {
        // Trigger the POS submission as a background job
        // Example using a conceptual queue system
        await queue.add('sendOrderToPos', { orderId: newOrder.id });

        // Update local order status to indicate it's queued for sending
        newOrder.status = 'queued_for_pos';
        await newOrder.save();

        // Clear the user's cart
        await db.Cart.destroy({ where: { user_id: userId } });

        // Trigger user notification "Order received, pending confirmation"
        await createNotification(userId, 'Order Received', 'Your order has been placed and is being processed.', newOrder.id);

        return { order: newOrder };

    } catch (error) {
        console.error(`Failed to queue order ${newOrder.id} for POS:`, error);
        // Update order status to failed if queueing fails
        newOrder.status = 'internal_error'; // Or a specific 'queue_failed' status
        await newOrder.save();
        // Notify user of failure
        await createNotification(userId, 'Order Failed', 'There was an error placing your order. Please try again or contact support.', newOrder.id);
        throw new Error('Could not process order.'); // Propagate error back to API handler if needed
    }
}

// --- In the background job handler for 'sendOrderToPos' ---
// This function would be executed by your background worker
async function processSendOrderJob(job) {
    const { orderId } = job.data;
    try {
        const order = await db.Order.findByPk(orderId, {
            include: [db.User, db.Branch, db.OrderItem]
        });

        if (!order) {
            console.error(`Job failed: Order ${orderId} not found.`);
            // Mark job as failed
            throw new Error(`Order ${orderId} not found`);
        }

        // Re-fetch latest data needed for POS payload if necessary
        // (depends on how comprehensive the initial fetch was)
        const posResponse = await sendOrderToPos(order);

        // Update local order with POS response details
        order.pos_order_id = posResponse.pos_order_id; // Or whatever field name POS uses
        order.status = 'sent_to_pos'; // Or 'processing' if POS API confirms immediately
        order.pos_sent_at = new Date();
        await order.save();

        // Trigger notification for user: "Order Confirmed by Store"
        await createNotification(order.user_id, 'Order Confirmed', `Your order #${order.id} has been confirmed by the branch.`, order.id);

        // Mark job as successful
        job.done(); // Or return value depending on queue library

    } catch (error) {
        console.error(`Background job failed for order ${orderId}:`, error);
        // Update local order status to reflect POS submission failure
        const order = await db.Order.findByPk(orderId); // Fetch again if not in catch scope
        if (order) {
            order.status = 'pos_submission_failed';
            order.notes = `POS submission failed: ${error.message}`;
            await order.save();
             // Trigger user notification: "Order confirmation failed"
            await createNotification(order.user_id, 'Order Issue', `Failed to send your order #${order.id} to the store. Please contact support.`, order.id);
        }
        // Mark job as failed (potential retry configured in queue system)
        throw error; // Queue system handles retries based on this
    }
}
```

These examples illustrate key pieces of the backend logic and interaction with the POS API. The actual implementation will depend on the chosen technology stack and the specifics of the POS API documentation.

```
```
