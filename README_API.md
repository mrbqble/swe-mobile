## Mobile API Integration Guide (detailed)

This document describes the expected HTTP API surface the mobile app calls (mock-first). It is written for backend engineers to implement server endpoints and database behavior so the mobile app works correctly when `USE_MOCK=false` in `src/api/index.ts`.

Base URL
- Placeholder in adapters: `http://YOUR_API_BASE_HERE`

General guidelines
- The mobile app expects JSON APIs and standard HTTP codes (200/201/204/4xx/5xx).
- Use consistent IDs (string) for resources (orders, products, complaints, escalations). Mobile code treats ids as strings.
- All timestamps should be ISO-8601 (UTC) strings, e.g. `2024-01-15T10:30:00Z`.
- Keep payload shapes stable: changing property names will require front-end updates.
- Where possible, return the full resource after changes (PATCH/POST) so the frontend can update without extra requests.

Auth & scoping
- The mobile app currently uses a mock user; in production you'll have authenticated users and a supplier identifier. Endpoints should scope data by supplier (e.g., GET /api/orders?supplier=Acme%20Corp) and enforce permissions server-side.

Pagination and filtering
- Use `?page=` and `?limit=` query params for list endpoints. Include a `meta` object with `page`, `limit`, `total`, `pages` when returning lists.

Error handling
- Return 4xx for client errors with a JSON body { error: 'message', code?: 'SOME_CODE' }.
- Return helpful messages for validation errors.

Content summary (endpoints and shapes)

1) Catalog / Products

GET /api/catalog?search={string}&page={number}&limit={number}&supplier={supplierName}
- Response 200
  {
    data: [ Product ],
    meta: { page: number, limit: number, total: number, pages: number }
  }

GET /api/products/:id
- Response 200: Product

PATCH /api/products/:id
- Body: { stock: number }
- Response 200: updated Product
- Notes: The mobile app will only call PATCH to change the `stock` field. Do not change other fields unexpectedly.

DELETE /api/products/:id
- Response 200/204 on success.
- Notes: When a product is deleted, return 200 and the deleted id or 204. Emit any server-side events/notifications to keep other clients in sync.

Product shape (example)
{
  id: string | number,
  name: string,
  description?: string,
  price: number, // integer in base units (decide cents vs units, document)
  currency?: string, // e.g. "KZT"
  stock: number,
  imageUrl?: string,
  sku?: string,
  supplier?: string,
  supplierId?: string | number
}

Backend notes
- PATCH and DELETE should be authorized so only the product owner (supplier) can change stock or remove products.
- After updating/deleting, return the updated product or 204, and consider emitting a websocket/event to notify active clients. The mobile mock uses an event emitter; backend teams can hook websockets or push notifications.

2) Orders

GET /api/orders?consumerId={id}&supplier={supplierName}
- Response 200: Order[]

GET /api/orders/:id
- Response 200: Order

POST /api/orders
- Body: { items: Array<OrderItem>, total: number, consumerId?: string }
- Response 201: created Order

POST /api/orders/:id/status
- Body: { status: 'Created'|'Accepted'|'In Progress'|'Resolved'|'Rejected'|'Completed', by?: string }
- Response 200: updated Order

Order shape (example)
{
  id: string,
  orderNumber: string, // human-readable like ORD-001
  supplier: string,
  date: string, // ISO created date
  total: number,
  itemsCount: number,
  items?: [ { productId, name, price, qty } ],
  status: string,
  statusHistory?: [ { status: string, ts: string, by?: string } ]
}

Backend notes
- `statusHistory` is required for the timeline UI in the mobile app. When status changes, append an entry { status, ts: ISO, by } and return the entire order.
- The mobile UI infers open orders as those not in `Resolved` or `Completed` — coordinate if you need a stricter definition.

3) Complaints (Issue escalation)

POST /api/complaints
- Body: { orderId: string, consumerId?: string, supplier?: string, reason?: string, consumerName?: string }
- Response 201: created Complaint

GET /api/complaints?supplier={supplierName}
- Response 200: Complaint[]

GET /api/complaints?consumerId={consumerId}
- Response 200: Complaint[]

GET /api/complaints/:id
- Response 200: single Complaint

POST /api/complaints/:id/status
- Body: { status: 'Open'|'In Progress'|'Resolved'|'Rejected' }
- Response 200: updated Complaint

POST /api/complaints/:id/escalate
- Body: {} (none required) or optional { escalateTo?: string }
- Response 200: escalation record or 201 created

Complaint shape (example)
{
  id: string,
  orderId: string,
  consumerId?: string,
  consumerName?: string,
  supplier?: string,
  reason?: string,
  status?: 'Open'|'In Progress'|'Resolved'|'Rejected',
  createdAt: string
}

Escalation record (server-managed)
{
  id: string,
  complaintId: string,
  orderId: string,
  supplier?: string,
  consumerName?: string,
  reason?: string,
  createdAt: string
}

Backend notes
- When the mobile app calls `/api/complaints/:id/escalate`, the server should persist an escalation record that the web manager UI can consume. The manager will use the `orderId` (thread id) to view chat history and the complaint details to resolve the issue.
- Upon escalate, backend may set complaint.status = 'In Progress' (or another agreed status).
- Implement pagination for GET /api/complaints if complaint volumes are large.

4) Chat (order-scoped threads)

GET /api/chat/:threadId/messages
- Response 200: [ ChatMessage ]

POST /api/chat/:threadId/messages
- Body: { from: string, text?: string, attachments?: Array<{ url: string; mime?: string }> }
- Response 201: created ChatMessage

POST /api/uploads
- Body: multipart/form-data file upload
- Response 200: { url: string } public URL for attachment

ChatMessage shape
{
  id: string,
  threadId: string, // orderId used as thread id
  from: string, // 'consumer' | 'supplier' | userId
  text?: string,
  attachments?: [ { url: string, mime?: string } ],
  ts: string,
  delivered?: boolean,
  read?: boolean
}

Backend notes
- The mobile app uses orderId as the chat thread id. Ensure chat threads are queryable by that id.
- Uploads endpoint should return a public URL consumable by mobile and web clients. Consider signed URLs for large files.

5) Linked suppliers / Link requests

GET /api/link-requests?supplier={supplierName}
- Response 200: LinkRequest[] (supplier-side pending requests)

POST /api/link-requests
- Body: { supplierId: string, consumerId?: string }
- Response 201: created LinkRequest

POST /api/link-requests/:id/status
- Body: { status: 'approved'|'rejected' }
- Response 200: updated LinkRequest

LinkRequest shape
{
  id: string,
  name: string,
  organization?: string,
  email?: string,
  date?: string,
  status: 'pending'|'approved'|'rejected',
  linkedId?: string
}

Backend notes
- `fetchLinkRequests` is used by the mobile supplier UI to show pending link requests and counts. If your service uses a different naming, implement an endpoint that returns the pending supplier requests.

Real-time and events
- The mobile mock uses an in-memory emitter (`emitter.emit('catalogChanged')`, `'ordersChanged'`, `'complaintsChanged'`, `'escalationsChanged'`, `'linkRequestsChanged'`, `'chatChanged:{threadId}'`) to signal updates.
- Backend should provide a push mechanism for real-time updates (WebSocket, Server-Sent Events, or push notifications). At minimum, ensure APIs return the updated resource so the mobile client can re-fetch after an action.

Integration checklist for backend teams
- Implement endpoints above with stable shapes and document any deviations.
- Ensure CORS is enabled for the mobile dev origin.
- For PATCH / DELETE on products, require supplier authentication and owner check.
- Persist `statusHistory` on orders when status changes and return it in GET /api/orders[/:id].
- Implement POST /api/complaints/:id/escalate to persist escalation records that the web manager UI will read.
- Implement uploads with public URLs or signed URLs; return a JSON payload { url }.
- Add sensible validation and return helpful 4xx JSON errors.
- Consider idempotency keys for destructive operations if your backend may receive retries.

Example flows (quick)

- Consumer reports complaint
  1. Mobile calls POST /api/complaints with { orderId, consumerId, supplier, reason, consumerName }.
  2. Server persists complaint and returns 201 + complaint object.
  3. Supplier mobile UI polls or receives event; complaint appears in supplier list.

- Supplier escalates complaint
  1. Supplier mobile calls POST /api/complaints/:id/escalate.
  2. Server persists escalation record (including orderId and complaint details) and returns success.
  3. Manager web UI queries GET /api/escalations or GET /api/complaints?escalated=true to pick up escalations and resolves via web tools.

Deployment & testing
- Provide a staging API base for mobile developers. Switch `src/api/index.ts` to `USE_MOCK=false` and set the BASE constant in HTTP adapters to point to the staging server.
- Add sample data to staging: products, orders, complaints and chats so mobile teams can test the full flows.

Appendix: status enums (keep consistent)
- Order.status: 'Created' | 'Accepted' | 'In Progress' | 'Resolved' | 'Rejected' | 'Completed'
- Complaint.status: 'Open' | 'In Progress' | 'Resolved' | 'Rejected'

If you want, I can also generate an OpenAPI/Swagger spec from this contract to accelerate backend implementation — say the word and I will produce it next.
