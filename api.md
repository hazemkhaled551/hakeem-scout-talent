# 📊 Admin Dashboard API Contract

## 🔗 Base URL

```
/api/v1/admin/dashboard
```

---

# 1️⃣ Get Dashboard Overview

### ✅ Endpoint

```
GET /api/v1/admin/dashboard
```

### 🎯 Description

Returns all data required for the Admin Dashboard screen:

* KPI statistics
* Activity summary
* Recent users
* Recent jobs

---

## 📥 Request

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Query Parameters (Optional)

| Param      | Type   | Description                      |
| ---------- | ------ | -------------------------------- |
| limitUsers | number | Number of recent users to return |
| limitJobs  | number | Number of recent jobs to return  |

---

## 📤 Response

### ✅ Success Response (200)

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 4821,
      "activeJobs": 138,
      "revenueMRR": 8240,
      "offersSent":312,
  
    },

    "activity": {
      "newSignupsToday": 14,
      "pendingVerifications": 7,
      "hiredThisWeek": 23,
      "rejectedToday": 5
    },

    "recentUsers": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "Applicant | Company | Admin",
        "status": "Online | Offline",
        "joinedAt": "ISO Date"
      }
    ],

    "recentJobs": [
      {
        "id": "string",
        "title": "string",
        "company": "string",
        "status": "Published | Draft | Closed | etc",
        "applicationsCount": 0,
        "postedAt": "ISO Date"
      }
    ]
  }
}
```

# 👥 Admin Users API Contract

## 🔗 Base URL

```
/api/v1/admin/users
```

---

# 1️⃣ Get Users List

### ✅ Endpoint

```
GET /api/v1/admin/users
```

### 🎯 Description

Returns paginated users list with filtering and search support:

* Users list
* Filters (role, status)
* Search
* Pagination
* Users stats

---

## 📥 Request

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Query Parameters (Optional)

| Param  | Type   | Description                                         |
| ------ | ------ | --------------------------------------------------- |
| page   | number | Current page number                                 |
| limit  | number | عدد العناصر في الصفحة (Page size) |
| search | string | Search by name or email                             |
| role   | string | Applicant                                           |
| status | string | Active                                              |

---

## 📤 Response

### ✅ Success Response (200)

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 8,
      "applicants": 4,
      "companies": 4,
      "suspended": 1
    },

    "users": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "Applicant | Company",
        "status": "Online | Offline",
        "verified": true,
        "plan": "Free | Pro | Enterprise | null",
        "joinedAt": "ISO Date"
      }
    ],

    "pagination": {
      "page": 1,
      "limit": 6,
      "total": 8,
      "totalPages": 2
    }
  }
}
```

---

## ❌ Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2️⃣ Get User Details

### ✅ Endpoint

```
GET /api/v1/admin/users/{id}
```

### 🎯 Description

Returns full details of a specific user.

---

## 📤 Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "jobTitle": "string",
    "linkedin_Profile": "string",
    "location":"string",
    "role": "Applicant | Company",
    "status": "Online | offline",
    "verified": true,
    "plan": "Free | Pro | Enterprise | null",
    "joinedAt": "ISO Date"
  }
}
```

---

# 3️⃣ Ban User

### ✅ Endpoint

```
PATCH /api/v1/admin/users/{id}/ban
```

### 🎯 Description

Suspend (ban) a user.

---

## 📤 Response

```json
{
  "success": true,
  "message": "User suspended successfully"
}
```

---

# 4️⃣ Unban User

### ✅ Endpoint

```
PATCH /api/v1/admin/users/{id}/unban
```

### 🎯 Description

Restore a suspended user.

---

## 📤 Response

```json
{
  "success": true,
  "message": "User restored successfully"
}
```

---

# ✅ Summary

This set of endpoints fully supports:

* Users table
* Filters & search
* Pagination
* User actions (ban / unban)
* User details view

Optimized for scalable admin panel usage.

# 🏢 Admin Companies API Contract

## 🔗 Base URL

```id=
/api/v1/admin/companies
```

---

# 1️⃣ Get Companies List

### ✅ Endpoint

```id=
GET /api/v1/admin/companies
```

### 🎯 Description

Returns paginated companies list with filtering and search support:

* Companies list
* Filters (plan, status)
* Search
* Pagination
* Companies stats

---

## 📥 Request

### Headers

```id=
Authorization: Bearer <token>
Content-Type: application/json
```

### Query Parameters (Optional)

| Param  | Type   | Description                     |
| ------ | ------ | ------------------------------- |
| page   | number | Current page number             |
| limit  | number | Number of items per page        |
| search | string | Search by company name or email |
| plan   | string | Free                            |
| status | string | Active                          |

---

## 📤 Response

### ✅ Success Response (200)

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCompanies": 8,
      "active": 6,
      "proAndEnterprise": 5,
      "suspended": 1
    },

    "companies": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "location": "string",
        "plan": "Free | Pro | Enterprise",
        "status": "Online | Offline",
        "verified": true,
        "jobs": 0,
        "hires": 0,
        "joinedAt": "ISO Date"
      }
    ],

    "pagination": {
      "page": 1,
      "limit": 6,
      "total": 8,
      "totalPages": 2
    }
  }
}
```

---

## ❌ Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2️⃣ Get Company Details

### ✅ Endpoint

```id=
GET /api/v1/admin/companies/{id}
```

### 🎯 Description

Returns full details of a specific company.

---

## 📤 Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "location": "string",
    "linkedin_profile":"string",
    "plan": "Free | Pro | Enterprise",
    "status": "Online | Offline",
    "verified": true,
    "jobs": 0,
    "hires": 0,
    "joinedAt": "ISO Date"
  }
}
```

---

# 3️⃣ Suspend Company

### ✅ Endpoint

```id=
PATCH /api/v1/admin/companies/{id}/ban

```

### 🎯 Description

Suspend (ban) a company account.

---

## 📤 Response

```json
{
  "success": true,
  "message": "Company suspended successfully"
}
```

---

# 4️⃣ Activate Company

### ✅ Endpoint

```id=
PATCH /api/v1/admin/companies/{id}/unban

```

### 🎯 Description

Restore a suspended company account.

---

## 📤 Response

```json
{
  "success": true,
  "message": "Company activated successfully"
}
```

---

# 🧠 Notes

* `jobs` → number of posted jobs
* `hires` → number of successful hires

---

# ✅ Summary

This set of endpoints fully supports:

* Companies table
* Filters & search
* Pagination
* Company actions (suspend / activate)
* Company details view

Optimized for admin dashboard scalability.

# 💼 Admin Jobs API Contract

## 🔗 Base URL

```id=
/api/v1/admin/jobs
```

---

# 1️⃣ Get Jobs List

### ✅ Endpoint

```id=
GET /api/v1/admin/jobs
```

### 🎯 Description

Returns paginated jobs list with filtering and search support:

* Jobs list
* Filter by status
* Search (title / company)
* Pagination
* Jobs stats

---

## 📥 Request

### Headers

```id=
Authorization: Bearer <token>
Content-Type: application/json
```

### Query Parameters (Optional)

| Param  | Type   | Description                    |
| ------ | ------ | ------------------------------ |
| page   | number | Current page number            |
| limit  | number | Number of items per page       |
| search | string | Search by job title or company |
| status | string | Published                      |

---

## 📤 Response

### ✅ Success Response (200)

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalJobs": 8,
      "published": 3,
      "totalApplications": 195,
      "totalHired": 7
    },

    "jobs": [
      {
        "id": "string",
        "title": "string",
        "company": "string",
        "location": "string",
        "type": "Full_Time | Part_Time | Contract | etc",
        "workMode": "Remote | Onsite | Hybrid",
        "status": "Published | Draft | Paused | Closed | Filled | Expired",
        "postedAt": "ISO Date",
        "deadline": "ISO Date"
      }
    ],

    "pagination": {
      "page": 1,
      "limit": 6,
      "total": 8,
      "totalPages": 2
    }
  }
}
```

---

## ❌ Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2️⃣ Get Job Details

### ✅ Endpoint

```id=
GET /api/v1/admin/jobs/{id}
```

### 🎯 Description

Returns full details of a specific job.

---

## 📤 Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "company": "string",
    "location": "string",
    "type": "string",
    "workMode": "string",
    "status": "string",
    "applicants": 0,
    "hired": 0,
    "minSalary": "string",
    "maxSalary": "string",
    "postedAt": "ISO Date",
    "deadline": "ISO Date",
    "description": "string"
  }
}
```

---

# 🧠 Notes

* `type`:
  * Full_Time, Part_Time, Contract...
* `workMode`:
  * Remote / Onsite / Hybrid
* `status`:
  * Published → visible
  * Draft → not published
  * Paused → temporarily hidden
  * Closed → manually closed
  * Filled → hiring completed
  * Expired → deadline passed
* `applicants` → total applications
* `hired` → successful hires
* Dates must be ISO format:

```id=
2026-04-17T12:00:00Z
```

---

# ✅ Summary

This set of endpoints fully supports:

* Jobs table
* Search & filtering
* Pagination
* Job actions (pause / resume / delete)
* Job details view

Optimized for admin job management.

# 💳 Admin Plans & Subscriptions API Contract

## 🔗 Base URL

```id=
/api/v1/admin/subscriptions
```

---

# 1️⃣ Get Subscriptions List

### ✅ Endpoint

```id=
GET /api/v1/admin/subscriptions
```

### 🎯 Description

Returns paginated subscriptions list with filtering and search support:

* Subscriptions list
* Filter by plan
* Search (company / email)
* Pagination
* Subscription stats (including MRR)

---

## 📥 Request

### Headers

```id=
Authorization: Bearer <token>
Content-Type: application/json
```

### Query Parameters (Optional)

| Param  | Type   | Description                |
| ------ | ------ | -------------------------- |
| page   | number | Current page number        |
| limit  | number | Number of items per page   |
| search | string | Search by company or email |
| plan   | string | Free                       |

---

## 📤 Response

### ✅ Success Response (200)

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalSubscriptions": 6,
      "proSubscribers": 3,
      "enterpriseSubscribers": 1,
      "mrr": 127
    },

    "subscriptions": [
      {
        "id": "string",
        "Name": "string",
        "email": "string",
        "plan": "Free | Pro | Enterprise",
        "billing": "Monthly | Annual",
        "status": "Active | Cancelled | Past Due",
        "amount": "string",
        "startedAt": "ISO Date",
        "renewsAt": "ISO Date | null"
      }
    ],

    "pagination": {
      "page": 1,
      "limit": 6,
      "total": 6,
      "totalPages": 1
    }
  }
}
```

---

## ❌ Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 4️⃣ Update Subscription

### ✅ Endpoint

```id=
PATCH /api/v1/admin/subscriptions/{id}
```

### 🎯 Description

Update subscription plan, billing, or status.

---

## 📥 Body

```json
{
  "plan": "Free | Pro | Enterprise",
  "billing": "Monthly | Annual",
  "status": "Active | Cancelled | Past Due"
}
```

---

## 📤 Response

```json
{
  "success": true,
  "message": "Subscription updated successfully"
}
```

---

# 5️⃣ Delete Subscription

### ✅ Endpoint

```id=
DELETE /api/v1/admin/subscriptions/{id}
```

### 🎯 Description

Delete a subscription.

---

## 📤 Response

```json
{
  "success": true,
  "message": "Subscription deleted successfully"
}
```

---

# 🧠 Notes

* `plan`:
  * Free → no payment
  * Pro → standard paid
  * Enterprise → custom pricing
* `billing`:
  * Monthly
  * Annual
* `status`:
  * Active → subscription running
  * Cancelled → stopped
  * Past Due → payment issue
* `mrr`:
  * Monthly Recurring Revenue (number only)
* `amount`:
  * string for flexibility (e.g. "$49/mo", "Custom")
* Dates must be ISO format:

```id=
2026-04-17T12:00:00Z
```

---

# ✅ Summary

This set of endpoints fully supports:

* Subscriptions table
* Search & filtering
* Pagination
* Plan management (create / update / delete)
* Subscription tracking
* Revenue metrics (MRR)

Optimized for admin billing management.

# 💰 Admin Payments API Contract

## 🔗 Base URL

```id=
/api/v1/admin/payments
```

---

# 1️⃣ Get Payments List

### ✅ Endpoint

```id=
GET /api/v1/admin/payments
```

### 🎯 Description

Returns paginated payments (transactions) list with filtering and search support:

* Payments list
* Filter by status
* Search (company / invoice)
* Pagination
* Payments stats (revenue, transactions, failed, pending)

---

## 📥 Request

### Headers

```id=
Authorization: Bearer <token>
Content-Type: application/json
```

### Query Parameters (Optional)

| Param  | Type   | Description                          |
| ------ | ------ | ------------------------------------ |
| page   | number | Current page number                  |
| limit  | number | Number of items per page             |
| search | string | Search by company name or invoice ID |
| status | string | Paid                                 |

---

## 📤 Response

### ✅ Success Response (200)

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRevenue": 5865,
      "transactions": 8,
      "failed": 1,
      "pending": 1
    },

    "payments": [
      {
        "id": "string",
        "invoice": "string",
        "company": "string",
        "email": "string",
        "plan": "Free | Pro | Enterprise",
        "amount": 0,
        "currency": "USD",
        "billing": "Monthly | Annual",
        "method": "string",
        "status": "Paid | Pending | Failed | Refunded",
        "date": "ISO Date"
      }
    ],

    "pagination": {
      "page": 1,
      "limit": 6,
      "total": 8,
      "totalPages": 2
    }
  }
}
```

---

## ❌ Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 3️⃣ Retry Failed Payment

### ✅ Endpoint

```id=
POST /api/v1/admin/payments/{id}/retry
```

### 🎯 Description

Retry a failed payment transaction.

---

## 📤 Response

```json
{
  "success": true,
  "message": "Payment retried successfully"
}
```

---

# 🧠 Notes

* `amount`:
  * Number only (no `$` or commas)
  * Currency handled separately
* `currency`:
  * Example: USD
* `status`:
  * Paid → successful transaction
  * Pending → awaiting processing
  * Failed → payment failed
  * Refunded → refunded payment
* `method`:
  * Masked payment method (e.g. Visa ••4242)
* `invoice`:
  * Unique invoice identifier
* Dates must be ISO format:

```id=
2026-04-17T12:00:00Z
```

---

# ✅ Summary

This set of endpoints fully supports:

* Payments table
* Search & filtering
* Pagination
* Payment tracking
* Retry failed transactions
* Revenue analytics

Optimized for admin financial monitoring.



# 📊 Admin Company Plans API Contract

## 🔗 Base URL

<pre class="overflow-visible! px-0!" data-start="105" data-end="132"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute end-1.5 top-1 z-2 md:end-2 md:top-1"></div><div class="relative"><div class="pe-11 pt-3"><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>/api/v1/admin/plans</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

---

# 1️⃣ Get All Plans

### ✅ Endpoint

<pre class="overflow-visible! px-0!" data-start="176" data-end="207"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute end-1.5 top-1 z-2 md:end-2 md:top-1"></div><div class="relative"><div class="pe-11 pt-3"><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>GET /api/v1/admin/plans</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

### 🎯 Description

Returns all company plans with:

* Plan details
* Limits (jobs & users)
* Features
* Subscribers count
* Status

---

## 📥 Request

### Headers

<pre class="overflow-visible! px-0!" data-start="375" data-end="443"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute end-1.5 top-1 z-2 md:end-2 md:top-1"></div><div class="relative"><div class="pe-11 pt-3"><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>Authorization: Bearer <token></span><br/><span>Content-Type: application/json</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

### Query Parameters (Optional)

| Param  | Type   | Description            |
| ------ | ------ | ---------------------- |
| search | string | Search by name or slug |
| status | string | Active                 |
| page   | number | Page number            |
| limit  | number | Items per page         |

---

## 📤 Response

### ✅ Success Response (200)

<pre class="overflow-visible! px-0!" data-start="825" data-end="1548"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>{</span><br/><span>  "success": </span><span class="ͼq">true</span><span>,</span><br/><span>  "data": {</span><br/><span>    "plans": [</span><br/><span>      {</span><br/><span>        "id": </span><span class="ͼr">"string"</span><span>,</span><br/><span>        "name": </span><span class="ͼr">"string"</span><span>,</span><br/><span>        "slug": </span><span class="ͼr">"string"</span><span>,</span><br/><span>        "price": </span><span class="ͼr">"string"</span><span>,</span><br/><span>        "billing": </span><span class="ͼr">"Monthly | Annual | Custom"</span><span>,</span><br/><span>        "limits": {</span><br/><span>          "maxJobs": </span><span class="ͼr">"number | Unlimited"</span><span>,</span><br/><span>          "maxUsers": </span><span class="ͼr">"number | Unlimited"</span><br/><span>        },</span><br/><span>        "features": [</span><span class="ͼr">"string"</span><span>],</span><br/><span>        "status": </span><span class="ͼr">"Active | Inactive | Draft"</span><span>,</span><br/><span>        "subscribers": </span><span class="ͼq">0</span><span>,</span><br/><span>        "createdAt": </span><span class="ͼr">"ISO Date"</span><br/><span>      }</span><br/><span>    ],</span><br/><br/><span>    "stats": {</span><br/><span>      "totalPlans": </span><span class="ͼq">0</span><span>,</span><br/><span>      "activePlans": </span><span class="ͼq">0</span><span>,</span><br/><span>      "totalSubscribers": </span><span class="ͼq">0</span><span>,</span><br/><span>      "enterpriseSubscribers": </span><span class="ͼq">0</span><br/><span>    },</span><br/><br/><span>    "pagination": {</span><br/><span>      "page": </span><span class="ͼq">1</span><span>,</span><br/><span>      "limit": </span><span class="ͼq">10</span><span>,</span><br/><span>      "total": </span><span class="ͼq">0</span><span>,</span><br/><span>      "pages": </span><span class="ͼq">0</span><br/><span>    }</span><br/><span>  }</span><br/><span>}</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

---

# 2️⃣ Create Plan

### ✅ Endpoint

<pre class="overflow-visible! px-0!" data-start="1590" data-end="1622"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute end-1.5 top-1 z-2 md:end-2 md:top-1"></div><div class="relative"><div class="pe-11 pt-3"><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>POST /api/v1/admin/plans</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

### 🎯 Description

Create a new subscription plan.

---

## 📥 Request Body

<pre class="overflow-visible! px-0!" data-start="1702" data-end="1938"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>{</span><br/><span>  "name": </span><span class="ͼr">"Pro"</span><span>,</span><br/><span>  "slug": </span><span class="ͼr">"pro"</span><span>,</span><br/><span>  "price": </span><span class="ͼr">"$49/mo"</span><span>,</span><br/><span>  "billing": </span><span class="ͼr">"Monthly"</span><span>,</span><br/><span>  "maxJobs": </span><span class="ͼq">50</span><span>,</span><br/><span>  "maxUsers": </span><span class="ͼq">10</span><span>,</span><br/><span>  "features": [</span><br/><span></span><span class="ͼr">"50 Job Posts"</span><span>,</span><br/><span></span><span class="ͼr">"Full Analytics"</span><span>,</span><br/><span></span><span class="ͼr">"Priority Support"</span><br/><span>  ],</span><br/><span>  "status": </span><span class="ͼr">"Active"</span><br/><span>}</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

---

## 📤 Response

<pre class="overflow-visible! px-0!" data-start="1961" data-end="2036"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>{</span><br/><span>  "success": </span><span class="ͼq">true</span><span>,</span><br/><span>  "message": </span><span class="ͼr">"Plan created successfully"</span><br/><span>}</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

---

# 3️⃣ Update Plan

### ✅ Endpoint

<pre class="overflow-visible! px-0!" data-start="2078" data-end="2113"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute end-1.5 top-1 z-2 md:end-2 md:top-1"></div><div class="relative"><div class="pe-11 pt-3"><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>PUT /api/v1/admin/plans/:id</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

### 🎯 Description

Update an existing plan.

---

## 📥 Request Body

<pre class="overflow-visible! px-0!" data-start="2186" data-end="2268"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>{</span><br/><span>  "name": </span><span class="ͼr">"Pro Updated"</span><span>,</span><br/><span>  "price": </span><span class="ͼr">"$59/mo"</span><span>,</span><br/><span>  "status": </span><span class="ͼr">"Active"</span><br/><span>}</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

---

## 📤 Response

<pre class="overflow-visible! px-0!" data-start="2291" data-end="2366"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>{</span><br/><span>  "success": </span><span class="ͼq">true</span><span>,</span><br/><span>  "message": </span><span class="ͼr">"Plan updated successfully"</span><br/><span>}</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

---

# 4️⃣ Delete Plan

### ✅ Endpoint

<pre class="overflow-visible! px-0!" data-start="2408" data-end="2446"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute end-1.5 top-1 z-2 md:end-2 md:top-1"></div><div class="relative"><div class="pe-11 pt-3"><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>DELETE /api/v1/admin/plans/:id</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>

### 🎯 Description

Delete a plan.

---

## 📤 Response

<pre class="overflow-visible! px-0!" data-start="2505" data-end="2580"><div class="relative w-full mt-4 mb-1"><div class=""><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼk ͼy"><div class="cm-scroller"><div class="cm-content q9tKkq_readonly"><span>{</span><br/><span>  "success": </span><span class="ͼq">true</span><span>,</span><br/><span>  "message": </span><span class="ͼr">"Plan deleted successfully"</span><br/><span>}</span></div></div></div></div></div></div></div></div></div></div><div class=""><div class=""></div></div></div></div></div></pre>
