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
