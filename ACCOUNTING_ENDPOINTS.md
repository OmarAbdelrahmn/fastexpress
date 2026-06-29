# Accounting, Reports, and Company Finance API Contracts

This document is for frontend integration. It lists the accounting-related endpoints used by the current app, including route, request, and expected response shape.

Source of truth used here:

- `src/lib/api/endpoints.js`
- Accounting/maintenance pages under `src/app/admin/maintenance`
- Accounting report pages under `src/app/admin/reports`
- Wallet finance pages under `src/app/admin/hunger`
- Company finance dashboard under `src/app/admin/reports/dashboard/tabs/CompaniesTab.js`

Some response fields are inferred from how the frontend reads the API response. If the backend Swagger/OpenAPI differs, update this file and the frontend together.

## Base URL and Auth

Base URL:

```txt
NEXT_PUBLIC_API_URL
```

Fallback used by the frontend:

```txt
https://fastexpress.tryasp.net
```

Headers for JSON requests:

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

For upload endpoints, do not send `Content-Type: application/json`; use `multipart/form-data` with browser-generated boundary.

Common backend error shape:

```json
{
  "title": "Validation error",
  "status": 400,
  "detail": "Details about the error",
  "error": {
    "code": "ERROR_CODE",
    "description": "Human readable message"
  }
}
```

## Important Frontend Contract Notes

1. `API_ENDPOINTS.BILL.UPDATE(id)` is used in `src/app/admin/maintenance/bills/page.js`, but it is missing from `src/lib/api/endpoints.js`.

Add this to `BILL`:

```js
UPDATE: (id) => `/api/Bill/${id}`,
```

2. Change password sends `newPassord` with this exact spelling. Do not rename it to `newPassword` unless backend and frontend are changed together.

3. `itemType` is used in bills, transfers, and returns:

```txt
1 = Spare Part
2 = Rider Accessory
```

---

# 1. Accountant Auth and Account

## 1.1 Accountant Login

Frontend route:

```txt
/accountant/login
```

API route:

```http
POST /api/auth/login
```

Request:

```json
{
  "username": "accountant_user",
  "password": "password"
}
```

Expected response:

```json
{
  "token": "jwt-token",
  "user": {
    "userName": "accountant_user",
    "fullName": "Accountant Name",
    "roles": ["Accountant"]
  }
}
```

Frontend detail:

- User must have the `Accountant` role.
- On success, frontend redirects to `/accountant/dashboard`.

## 1.2 Get Current Account

API route:

```http
GET /api/me
```

Request:

```txt
No body
```

Expected response:

```json
{
  "userName": "accountant_user",
  "fullName": "Accountant Name",
  "address": "Riyadh"
}
```

## 1.3 Update Account Info

API route:

```http
PUT /api/me/info
```

Request:

```json
{
  "fullName": "Accountant Name",
  "address": "Riyadh"
}
```

Expected response:

```json
{
  "userName": "accountant_user",
  "fullName": "Accountant Name",
  "address": "Riyadh"
}
```

## 1.4 Change Password

API route:

```http
PUT /api/me/change-password
```

Request:

```json
{
  "currentPassword": "old-password",
  "newPassord": "new-password"
}
```

Expected response:

```json
{
  "message": "Password changed successfully"
}
```

---

# 2. Accounting Master Data

## 2.1 Suppliers

### List Suppliers

```http
GET /api/Supplier
```

Request:

```txt
No body
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Supplier Name",
    "contactPerson": "Contact Person",
    "phone": "0500000000",
    "email": "supplier@example.com",
    "address": "Address",
    "taxNumber": "123456789",
    "commercialRegister": "CR-123",
    "isActive": true
  }
]
```

### Get Supplier By ID

```http
GET /api/Supplier/{id}
```

Path params:

```txt
id: number
```

Expected response:

```json
{
  "id": 1,
  "name": "Supplier Name",
  "contactPerson": "Contact Person",
  "phone": "0500000000",
  "email": "supplier@example.com",
  "address": "Address",
  "taxNumber": "123456789",
  "commercialRegister": "CR-123",
  "isActive": true
}
```

### Create Supplier

```http
POST /api/Supplier
```

Request:

```json
{
  "name": "Supplier Name",
  "contactPerson": "Contact Person",
  "phone": "0500000000",
  "email": "supplier@example.com",
  "address": "Address",
  "taxNumber": "123456789",
  "commercialRegister": "CR-123"
}
```

Expected response:

```json
{
  "id": 1,
  "name": "Supplier Name",
  "contactPerson": "Contact Person",
  "phone": "0500000000",
  "email": "supplier@example.com",
  "address": "Address",
  "taxNumber": "123456789",
  "commercialRegister": "CR-123",
  "isActive": true
}
```

### Update Supplier

```http
PUT /api/Supplier/{id}
```

Request:

```json
{
  "name": "Supplier Name",
  "contactPerson": "Contact Person",
  "phone": "0500000000",
  "email": "supplier@example.com",
  "address": "Address",
  "taxNumber": "123456789",
  "commercialRegister": "CR-123"
}
```

Expected response:

```json
{
  "id": 1,
  "name": "Supplier Name",
  "contactPerson": "Contact Person",
  "phone": "0500000000",
  "email": "supplier@example.com",
  "address": "Address",
  "taxNumber": "123456789",
  "commercialRegister": "CR-123",
  "isActive": true
}
```

### Delete Supplier

```http
DELETE /api/Supplier/{id}
```

Expected response:

```json
{
  "message": "Supplier deleted successfully"
}
```

### Toggle Supplier Active

```http
PATCH /api/Supplier/{id}/toggle-active
```

Request:

```txt
No body
```

Expected response:

```json
{
  "id": 1,
  "isActive": false
}
```

## 2.2 Spare Parts

### List Spare Parts

```http
GET /api/SparePart
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Oil Filter",
    "quantity": 10,
    "price": 25.5,
    "location": "الشركة"
  }
]
```

### List Available Spare Parts

Used by bill, transfer, and usage forms.

```http
GET /api/SparePart/2
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Oil Filter",
    "quantity": 10,
    "price": 25.5,
    "location": "الشركة"
  }
]
```

### Create Spare Part

```http
POST /api/SparePart
```

Request:

```json
{
  "name": "Oil Filter",
  "quantity": 10,
  "price": 25.5,
  "location": "الشركة"
}
```

Expected response:

```json
{
  "id": 1,
  "name": "Oil Filter",
  "quantity": 10,
  "price": 25.5,
  "location": "الشركة"
}
```

### Update Spare Part

```http
PUT /api/SparePart/{id}
```

Request:

```json
{
  "name": "Oil Filter",
  "quantity": 12,
  "price": 27,
  "location": "الشركة"
}
```

Expected response:

```json
{
  "id": 1,
  "name": "Oil Filter",
  "quantity": 12,
  "price": 27,
  "location": "الشركة"
}
```

### Delete Spare Part

```http
DELETE /api/SparePart/{id}
```

Expected response:

```json
{
  "message": "Spare part deleted successfully"
}
```

### Search Spare Parts

```http
GET /api/SparePart/search
```

Common query params:

```txt
search: string
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Oil Filter",
    "quantity": 10,
    "price": 25.5,
    "location": "الشركة"
  }
]
```

## 2.3 Rider Accessories

### List Rider Accessories

```http
GET /api/RiderAccessory
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Helmet",
    "quantity": 10,
    "price": 80,
    "location": "الشركة"
  }
]
```

### List Available Rider Accessories

Used by bill, transfer, return, and usage forms.

```http
GET /api/RiderAccessory/2
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Helmet",
    "quantity": 10,
    "price": 80,
    "location": "الشركة"
  }
]
```

### Create Rider Accessory

```http
POST /api/RiderAccessory
```

Request:

```json
{
  "name": "Helmet",
  "quantity": 10,
  "price": 80,
  "location": "الشركة"
}
```

Expected response:

```json
{
  "id": 1,
  "name": "Helmet",
  "quantity": 10,
  "price": 80,
  "location": "الشركة"
}
```

### Update Rider Accessory

```http
PUT /api/RiderAccessory/{id}
```

Request:

```json
{
  "name": "Helmet",
  "quantity": 12,
  "price": 80,
  "location": "الشركة"
}
```

Expected response:

```json
{
  "id": 1,
  "name": "Helmet",
  "quantity": 12,
  "price": 80,
  "location": "الشركة"
}
```

### Delete Rider Accessory

```http
DELETE /api/RiderAccessory/{id}
```

Expected response:

```json
{
  "message": "Rider accessory deleted successfully"
}
```

### Search Rider Accessories

```http
GET /api/RiderAccessory/search
```

Common query params:

```txt
search: string
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Helmet",
    "quantity": 10,
    "price": 80,
    "location": "الشركة"
  }
]
```

---

# 3. Accounting Operations

## 3.1 Bills / Supplier Invoices

### List Bills

```http
GET /api/Bill
```

Expected response:

```json
[
  {
    "id": 1,
    "supplierId": 1,
    "supplierName": "Supplier Name",
    "invoiceNumber": "INV-001",
    "invoiceDate": "2026-06-25T12:00:00.000Z",
    "notes": "Invoice notes",
    "totalAmount": 250,
    "items": [
      {
        "itemId": 1,
        "itemName": "Oil Filter",
        "itemType": 1,
        "quantity": 2,
        "unitPrice": 25.5,
        "totalPrice": 51
      }
    ]
  }
]
```

### Get Bill By ID

```http
GET /api/Bill/{id}
```

Expected response:

```json
{
  "id": 1,
  "supplierId": 1,
  "supplierName": "Supplier Name",
  "invoiceNumber": "INV-001",
  "invoiceDate": "2026-06-25T12:00:00.000Z",
  "notes": "Invoice notes",
  "totalAmount": 250,
  "items": [
    {
      "itemId": 1,
      "itemName": "Oil Filter",
      "itemType": 1,
      "quantity": 2,
      "unitPrice": 25.5,
      "totalPrice": 51
    }
  ]
}
```

### Create Bill

```http
POST /api/Bill
```

Request:

```json
{
  "supplierId": 1,
  "invoiceNumber": "INV-001",
  "invoiceDate": "2026-06-25T12:00:00.000Z",
  "notes": "Invoice notes",
  "items": [
    {
      "itemId": 1,
      "itemType": 1,
      "quantity": 2,
      "unitPrice": 25.5
    },
    {
      "itemId": 5,
      "itemType": 2,
      "quantity": 1,
      "unitPrice": 80
    }
  ]
}
```

Expected response:

```json
{
  "id": 1,
  "supplierId": 1,
  "invoiceNumber": "INV-001",
  "invoiceDate": "2026-06-25T12:00:00.000Z",
  "notes": "Invoice notes",
  "totalAmount": 131,
  "items": [
    {
      "itemId": 1,
      "itemType": 1,
      "quantity": 2,
      "unitPrice": 25.5,
      "totalPrice": 51
    },
    {
      "itemId": 5,
      "itemType": 2,
      "quantity": 1,
      "unitPrice": 80,
      "totalPrice": 80
    }
  ]
}
```

### Update Bill

```http
PUT /api/Bill/{id}
```

Request:

```json
{
  "supplierId": 1,
  "invoiceNumber": "INV-001",
  "invoiceDate": "2026-06-25T12:00:00.000Z",
  "notes": "Updated notes",
  "items": [
    {
      "itemId": 1,
      "itemType": 1,
      "quantity": 3,
      "unitPrice": 25.5
    }
  ]
}
```

Expected response:

```json
{
  "id": 1,
  "supplierId": 1,
  "invoiceNumber": "INV-001",
  "invoiceDate": "2026-06-25T12:00:00.000Z",
  "notes": "Updated notes",
  "totalAmount": 76.5,
  "items": [
    {
      "itemId": 1,
      "itemType": 1,
      "quantity": 3,
      "unitPrice": 25.5,
      "totalPrice": 76.5
    }
  ]
}
```

### Delete Bill

```http
DELETE /api/Bill/{id}
```

Expected response:

```json
{
  "message": "Bill deleted successfully"
}
```

### Bills By Date Range

```http
GET /api/Bill/date-range
```

Query params:

```txt
fromDate: YYYY-MM-DD
toDate: YYYY-MM-DD
```

Expected response:

```json
[
  {
    "id": 1,
    "supplierId": 1,
    "supplierName": "Supplier Name",
    "invoiceNumber": "INV-001",
    "invoiceDate": "2026-06-25T12:00:00.000Z",
    "totalAmount": 250
  }
]
```

### Bills By Supplier

```http
GET /api/Bill/supplier/{supplierId}
```

Expected response:

```json
[
  {
    "id": 1,
    "supplierId": 1,
    "supplierName": "Supplier Name",
    "invoiceNumber": "INV-001",
    "invoiceDate": "2026-06-25T12:00:00.000Z",
    "totalAmount": 250
  }
]
```

## 3.2 Returns

### List Returns

```http
GET /api/return
```

Expected response:

```json
[
  {
    "id": 1,
    "supplierId": 1,
    "supplierName": "Supplier Name",
    "returnNumber": "RET-001",
    "reason": "Damaged item",
    "processedBy": "accountant_user",
    "notes": "Return notes",
    "totalAmount": 25.5,
    "items": [
      {
        "itemId": 1,
        "itemName": "Oil Filter",
        "itemType": 1,
        "quantity": 1,
        "unitPrice": 25.5
      }
    ]
  }
]
```

### Create Return

```http
POST /api/return
```

Request:

```json
{
  "supplierId": 1,
  "returnNumber": "RET-001",
  "reason": "Damaged item",
  "processedBy": "accountant_user",
  "notes": "Return notes",
  "items": [
    {
      "itemId": 1,
      "itemName": "Oil Filter",
      "itemType": 1,
      "quantity": 1,
      "unitPrice": 25.5
    }
  ]
}
```

Expected response:

```json
{
  "id": 1,
  "supplierId": 1,
  "returnNumber": "RET-001",
  "reason": "Damaged item",
  "processedBy": "accountant_user",
  "notes": "Return notes",
  "totalAmount": 25.5,
  "items": [
    {
      "itemId": 1,
      "itemName": "Oil Filter",
      "itemType": 1,
      "quantity": 1,
      "unitPrice": 25.5
    }
  ]
}
```

### Update Return

```http
PUT /api/return/{id}
```

Request body is the same as Create Return.

Expected response is the updated return object.

### Delete Return

```http
DELETE /api/return/{id}
```

Expected response:

```json
{
  "message": "Return deleted successfully"
}
```

## 3.3 Transfers

### List Transfers

```http
GET /api/Transfer
```

Expected response:

```json
[
  {
    "id": 1,
    "housingId": 3,
    "housingName": "Housing Name",
    "transferredAt": "2026-06-25T12:00:00.000Z",
    "notes": "Transfer notes",
    "items": [
      {
        "itemId": 1,
        "itemName": "Oil Filter",
        "itemType": 1,
        "quantity": 2,
        "unitPrice": 0
      }
    ]
  }
]
```

### Get Transfer By ID

```http
GET /api/Transfer/{id}
```

Expected response:

```json
{
  "id": 1,
  "housingId": 3,
  "housingName": "Housing Name",
  "transferredAt": "2026-06-25T12:00:00.000Z",
  "notes": "Transfer notes",
  "items": [
    {
      "itemId": 1,
      "itemName": "Oil Filter",
      "itemType": 1,
      "quantity": 2,
      "unitPrice": 0
    }
  ]
}
```

### Create Transfer

```http
POST /api/Transfer
```

Request:

```json
{
  "housingId": 3,
  "transferredAt": "2026-06-25T12:00:00.000Z",
  "notes": "Transfer notes",
  "items": [
    {
      "itemId": 1,
      "itemType": 1,
      "quantity": 2,
      "unitPrice": 0
    },
    {
      "itemId": 5,
      "itemType": 2,
      "quantity": 1,
      "unitPrice": 0
    }
  ]
}
```

Expected response:

```json
{
  "id": 1,
  "housingId": 3,
  "transferredAt": "2026-06-25T12:00:00.000Z",
  "notes": "Transfer notes",
  "items": [
    {
      "itemId": 1,
      "itemType": 1,
      "quantity": 2,
      "unitPrice": 0
    }
  ]
}
```

### Update Transfer

```http
PUT /api/Transfer/{id}
```

Request body is the same as Create Transfer.

Expected response is the updated transfer object.

### Delete Transfer

```http
DELETE /api/Transfer/{id}
```

Expected response:

```json
{
  "message": "Transfer deleted successfully"
}
```

### Transfers By Housing

```http
GET /api/Transfer/housing/{housingId}
```

Expected response:

```json
[
  {
    "id": 1,
    "housingId": 3,
    "housingName": "Housing Name",
    "transferredAt": "2026-06-25T12:00:00.000Z",
    "items": []
  }
]
```

## 3.4 Spare Part Usage

### Record Spare Part Usage

```http
POST /api/SparePart/spare-parts?date={date}
```

Query params:

```txt
date: datetime, example 2026-06-25T12:00:00
```

Request:

```json
{
  "usages": [
    {
      "sparePartId": 1,
      "vehicleNumber": "VH-001",
      "quantityUsed": 2
    }
  ]
}
```

Expected response:

```json
{
  "message": "Usage recorded successfully",
  "createdCount": 1,
  "usages": [
    {
      "usageId": 100,
      "sparePartId": 1,
      "vehicleNumber": "VH-001",
      "quantityUsed": 2,
      "unitPrice": 25.5,
      "totalCost": 51,
      "usageDate": "2026-06-25T12:00:00"
    }
  ]
}
```

### Spare Part History By Item

```http
GET /api/SparePart/{id}/history
```

Expected response:

```json
{
  "itemId": 1,
  "itemName": "Oil Filter",
  "summary": {
    "totalQuantityUsed": 10,
    "totalUsageCost": 255,
    "totalTransferEvents": 2,
    "totalUsageEvents": 5
  },
  "usages": [
    {
      "usageId": 100,
      "vehicleNumber": "VH-001",
      "quantityUsed": 2,
      "unitPrice": 25.5,
      "totalCost": 51,
      "usedAt": "2026-06-25T12:00:00"
    }
  ],
  "transfers": [
    {
      "transferId": 10,
      "housingName": "Housing Name",
      "quantityTransferred": 3,
      "transferredAt": "2026-06-24T12:00:00"
    }
  ]
}
```

### Spare Part Vehicle History

```http
GET /api/SparePart/vehicle/{vehicleNumber}/history
```

Expected response:

```json
[
  {
    "usageId": 100,
    "sparePartId": 1,
    "sparePartName": "Oil Filter",
    "vehicleNumber": "VH-001",
    "quantityUsed": 2,
    "unitPrice": 25.5,
    "totalCost": 51,
    "usedAt": "2026-06-25T12:00:00"
  }
]
```

### Update Spare Part Usage

```http
PUT /api/SparePart/usage/{usageId}
```

Request:

```json
{
  "vehicleNumber": "VH-001",
  "quantityUsed": 2
}
```

Expected response:

```json
{
  "usageId": 100,
  "vehicleNumber": "VH-001",
  "quantityUsed": 2,
  "totalCost": 51
}
```

### Delete Spare Part Usage

```http
DELETE /api/SparePart/usage/{usageId}
```

Expected response:

```json
{
  "message": "Usage deleted successfully"
}
```

## 3.5 Rider Accessory Usage / Issuance

### Record Rider Accessory Usage

```http
POST /api/RiderAccessory/accessories?date={date}
```

Query params:

```txt
date: datetime, example 2026-06-25T12:00:00
```

Request currently sent by frontend:

```json
{
  "usages": [
    {
      "accessoryId": 1,
      "riderId": 55
    }
  ]
}
```

Frontend note:

- UI collects `quantityUsed`, but the current request does not send it.
- If backend requires quantity, frontend should be updated to send it.

Expected response:

```json
{
  "message": "Accessory issued successfully",
  "createdCount": 1,
  "usages": [
    {
      "usageId": 200,
      "accessoryId": 1,
      "riderId": 55,
      "priceAtIssuance": 80,
      "issuedAt": "2026-06-25T12:00:00"
    }
  ]
}
```

### Rider Accessory History By Item

```http
GET /api/RiderAccessory/{id}/history
```

Expected response:

```json
{
  "itemId": 1,
  "itemName": "Helmet",
  "summary": {
    "totalTimesIssued": 5,
    "totalIssuanceCost": 400,
    "totalTransferEvents": 2,
    "totalUsageEvents": 5
  },
  "issuances": [
    {
      "usageId": 200,
      "riderId": 55,
      "riderNameAR": "اسم السائق",
      "riderNameEN": "Rider Name",
      "workingId": "W-001",
      "riderHousing": "Housing Name",
      "priceAtIssuance": 80,
      "issuedAt": "2026-06-25T12:00:00"
    }
  ],
  "transfers": [
    {
      "transferId": 10,
      "housingName": "Housing Name",
      "quantityTransferred": 3,
      "transferredAt": "2026-06-24T12:00:00"
    }
  ]
}
```

### Rider Accessory History By Rider

```http
GET /api/RiderAccessory/rider/{riderId}
```

Expected response:

```json
[
  {
    "usageId": 200,
    "accessoryId": 1,
    "accessoryName": "Helmet",
    "riderId": 55,
    "riderNameAR": "اسم السائق",
    "riderNameEN": "Rider Name",
    "workingId": "W-001",
    "quantity": 1,
    "unitPrice": 80,
    "totalCost": 80,
    "issuedAt": "2026-06-25T12:00:00"
  }
]
```

---

# 4. Accounting Reports

## 4.1 Vehicle and Rider Cost Report

```http
GET /api/CostTracking/vehicles-rider-costs?fromDate={fromDate}&toDate={toDate}
```

Query params:

```txt
fromDate: YYYY-MM-DD
toDate: YYYY-MM-DD
```

Request:

```txt
No body
```

Expected response:

```json
[
  {
    "vehicleNumber": "VH-001",
    "plateNumberA": "ABC123",
    "plateNumberE": "123ABC",
    "totalVehicleCost": 500,
    "totalUsageCount": 4,
    "riderShares": [
      {
        "riderId": 55,
        "riderNameAR": "اسم السائق",
        "riderNameEN": "Rider Name",
        "workingId": "W-001",
        "costShare": 250
      }
    ]
  }
]
```

Frontend usage:

- Shows total vehicle cost.
- Shows total usage count.
- Opens modal with rider cost shares.

## 4.2 All Housing Costs

```http
GET /api/sparepart/all-housings?fromDate={fromDate}&toDate={toDate}
```

Query params:

```txt
fromDate: YYYY-MM-DD
toDate: YYYY-MM-DD
```

Expected response:

```json
{
  "housingCosts": [
    {
      "housingId": 3,
      "housingName": "Housing Name",
      "riderCount": 15,
      "sparePartsCost": 1000,
      "accessoriesCost": 500,
      "totalCost": 1500
    }
  ],
  "companyStock": {
    "sparePartsCost": 200,
    "accessoriesCost": 100,
    "totalCost": 300
  }
}
```

## 4.3 All Housing Cost Details

```http
GET /api/SparePart/all-housings/details?fromDate={fromDate}&toDate={toDate}
```

Query params:

```txt
fromDate: YYYY-MM-DD
toDate: YYYY-MM-DD
```

Expected response:

```json
{
  "totalCompanyCost": 1500,
  "totalCompanySparePartsCost": 1000,
  "totalCompanyAccessoriesCost": 500,
  "housings": [
    {
      "housingId": 3,
      "housingName": "Housing Name",
      "vehicleUsages": [
        {
          "vehicleNumber": "VH-001",
          "vehiclePlate": "ABC123",
          "items": [
            {
              "itemId": 1,
              "itemName": "Oil Filter",
              "quantityUsed": 2,
              "unitPrice": 25.5,
              "totalCost": 51,
              "usedAt": "2026-06-25T12:00:00"
            }
          ]
        }
      ],
      "riderUsages": [
        {
          "riderId": 55,
          "riderNameAR": "اسم السائق",
          "riderNameEN": "Rider Name",
          "workingId": "W-001",
          "items": [
            {
              "itemId": 5,
              "itemName": "Helmet",
              "quantity": 1,
              "price": 80,
              "issuedAt": "2026-06-25T12:00:00"
            }
          ]
        }
      ]
    }
  ],
  "companyStock": {
    "housingName": "مستودع الشركة / المخزون العام",
    "vehicleUsages": [],
    "riderUsages": []
  }
}
```

## 4.4 Spare Parts Movement Report

```http
GET /api/ItemMovementReport/spare-parts?fromDate={fromDate}T00:00:00&toDate={toDate}T23:59:59
```

Query params:

```txt
fromDate: datetime
toDate: datetime
```

Expected response:

```json
{
  "totals": {
    "totalItems": 10,
    "totalTransferEvents": 5,
    "totalUsageEvents": 20,
    "totalCostOfUsages": 1500,
    "totalQuantityTransferred": 50,
    "totalQuantityUsed": 30
  },
  "items": [
    {
      "itemId": 1,
      "itemName": "Oil Filter",
      "summary": {
        "totalQuantityUsed": 10,
        "totalUsageCost": 255,
        "totalTransferEvents": 2,
        "totalUsageEvents": 5
      },
      "usages": [
        {
          "vehicleNumber": "VH-001",
          "quantityUsed": 2,
          "totalCost": 51,
          "usedAt": "2026-06-25T12:00:00"
        }
      ],
      "transfers": [
        {
          "housingName": "Housing Name",
          "quantityTransferred": 3,
          "transferredAt": "2026-06-24T12:00:00"
        }
      ]
    }
  ]
}
```

## 4.5 Rider Accessories Movement Report

```http
GET /api/ItemMovementReport/accessories?fromDate={fromDate}T00:00:00&toDate={toDate}T23:59:59
```

Query params:

```txt
fromDate: datetime
toDate: datetime
```

Expected response:

```json
{
  "totals": {
    "totalItems": 10,
    "totalTransferEvents": 5,
    "totalUsageEvents": 20,
    "totalCostOfIssuances": 1500,
    "totalQuantityTransferred": 50,
    "totalTimesIssued": 30
  },
  "items": [
    {
      "itemId": 1,
      "itemName": "Helmet",
      "summary": {
        "totalTimesIssued": 10,
        "totalIssuanceCost": 800,
        "totalTransferEvents": 2,
        "totalUsageEvents": 10
      },
      "issuances": [
        {
          "riderId": 55,
          "riderNameAR": "اسم السائق",
          "riderNameEN": "Rider Name",
          "workingId": "W-001",
          "riderHousing": "Housing Name",
          "priceAtIssuance": 80,
          "issuedAt": "2026-06-25T12:00:00"
        }
      ],
      "transfers": [
        {
          "housingName": "Housing Name",
          "quantityTransferred": 3,
          "transferredAt": "2026-06-24T12:00:00"
        }
      ]
    }
  ]
}
```

## 4.6 Wallet Records

### Import Wallet File

```http
POST /api/wallet/import?date={date}
```

Query params:

```txt
date: YYYY-MM-DD
```

Request:

```txt
multipart/form-data
file: .xlsx or .xls
```

Expected response:

```json
{
  "totalRecords": 100,
  "createdCount": 90,
  "updatedCount": 8,
  "errorCount": 2,
  "errors": [
    {
      "row": 10,
      "workingId": "W-001",
      "message": "Rider not found"
    }
  ]
}
```

### Get Wallet Records

```http
GET /api/wallet
```

Expected response:

```json
[
  {
    "id": 1,
    "date": "2026-06-25",
    "workedRiderWorkingId": "W-001",
    "workedRiderNameAR": "اسم السائق",
    "workedRiderHousingName": "Housing Name",
    "isSubstitution": false,
    "mainRiderWorkingId": null,
    "mainRiderNameAR": null,
    "amount": 120.5
  }
]
```

## 4.7 Hunger Summary Finance Report

```http
GET /api/Report/hunger/summary
```

Query params:

```txt
startDate: YYYY-MM-DD
endDate: YYYY-MM-DD
```

Expected response:

```json
{
  "totalExpectedDays": 30,
  "companySummary": {
    "totalRiders": 100,
    "totalOrders": 5000,
    "tierDistribution": {
      "aboveTarget": 20,
      "onTarget": 50,
      "belowTarget": 30
    }
  },
  "housingDistributions": [
    {
      "housingId": 3,
      "housingName": "Housing Name",
      "totalRiders": 20,
      "totalOrders": 1000,
      "riders": [
        {
          "riderId": 55,
          "riderNameAR": "اسم السائق",
          "riderNameEN": "Rider Name",
          "workingId": "W-001",
          "totalOrders": 150
        }
      ]
    }
  ]
}
```

## 4.8 Hunger Detailed Daily Performance

```http
GET /api/Report/housing/detailed-daily-performance
```

Query params:

```txt
startDate: YYYY-MM-DD
endDate: YYYY-MM-DD
```

Expected response:

```json
{
  "totalExpectedDays": 30,
  "summary": {
    "totalHousings": 5,
    "totalRiders": 100,
    "totalWorkingDays": 2500,
    "totalAbsentDays": 100,
    "companyWideAttendanceRate": 96,
    "companyWideOrdersCompletionRate": 88
  },
  "housingDetails": [
    {
      "housingId": 3,
      "housingName": "Housing Name",
      "riders": [
        {
          "riderId": 55,
          "riderNameAR": "اسم السائق",
          "riderNameEN": "Rider Name",
          "workingId": "W-001",
          "dailyEntries": [
            {
              "date": "2026-06-25",
              "acceptedOrders": 20,
              "rejectedOrders": 1,
              "walletAmount": 120.5,
              "workingHours": 8
            }
          ],
          "periodSummary": {
            "totalAcceptedOrders": 500,
            "totalRejectedOrders": 10,
            "totalWalletAmount": 3000,
            "totalTargetOrders": 550,
            "totalHoursDifference": 2,
            "totalWorkingHours": 180,
            "averageHoursPerDay": 8,
            "hoursCompletionRate": 95,
            "ordersCompletionRate": 90,
            "overallPerformanceScore": 92
          }
        }
      ]
    }
  ]
}
```

## 4.9 Hunger Rejection Report

```http
GET /api/Report/all-housings/rejection
```

Query params:

```txt
startDate: YYYY-MM-DD
endDate: YYYY-MM-DD
```

Expected response:

```json
[
  {
    "housingId": 3,
    "housingName": "Housing Name",
    "rejectionReport": {
      "startDate": "2026-06-01",
      "endDate": "2026-06-25",
      "totalDays": 25,
      "riderDetails": [
        {
          "workingId": "W-001",
          "riderNameAR": "اسم السائق",
          "riderNameEN": "Rider Name",
          "totalShifts": 20,
          "totalOrders": 500,
          "targetOrders": 550,
          "totalRejections": 20,
          "totalRealRejections": 15,
          "rejectionRate": 3
        }
      ]
    }
  }
]
```

## 4.10 Keta Rejection Report

```http
GET /api/Report/all-housings/rejection2
```

Query params:

```txt
startDate: YYYY-MM-DD
endDate: YYYY-MM-DD
```

Expected response:

```json
[
  {
    "housingId": 3,
    "housingName": "Housing Name",
    "rejectionReport": {
      "startDate": "2026-06-01",
      "endDate": "2026-06-25",
      "totalDays": 25,
      "riderDetails": [
        {
          "workingId": "W-001",
          "riderNameAR": "اسم السائق",
          "riderNameEN": "Rider Name",
          "totalShifts": 20,
          "totalOrders": 500,
          "targetOrders": 550,
          "totalRejections": 20,
          "totalRealRejections": 15,
          "rejectionRate": 3
        }
      ]
    }
  }
]
```

## 4.11 Hunger Monthly Validation

```http
GET /api/HungerReports/monthly-validation
```

Query params:

```txt
year: number
month: number
```

Expected response:

```json
{
  "year": 2026,
  "month": 6,
  "summary": {
    "totalRiders": 100,
    "validRiders": 90,
    "invalidRiders": 10,
    "totalOrders": 5000
  },
  "riders": [
    {
      "riderId": 55,
      "workingId": "W-001",
      "riderNameAR": "اسم السائق",
      "riderNameEN": "Rider Name",
      "housingName": "Housing Name",
      "totalOrders": 500,
      "isValid": true,
      "validationNotes": []
    }
  ]
}
```

## 4.12 Keta Daily Summary

```http
GET /api/Report/keta/daily-summary?reportDate={reportDate}
```

Query params:

```txt
reportDate: YYYY-MM-DD
```

Expected response:

```json
{
  "reportDate": "2026-06-25",
  "summary": {
    "totalRiders": 100,
    "totalOrders": 5000,
    "totalShifts": 100
  },
  "housings": [
    {
      "housingId": 3,
      "housingName": "Housing Name",
      "totalRiders": 20,
      "totalOrders": 1000,
      "riders": [
        {
          "workingId": "W-001",
          "riderNameAR": "اسم السائق",
          "riderNameEN": "Rider Name",
          "orders": 50,
          "shifts": 1
        }
      ]
    }
  ]
}
```

## 4.13 Keta Daily Rider Details

```http
GET /api/Report/keta/daily-rider-details?reportDate={reportDate}
```

Query params:

```txt
reportDate: YYYY-MM-DD
```

Expected response:

```json
{
  "reportDate": "2026-06-25",
  "riders": [
    {
      "riderId": 55,
      "workingId": "W-001",
      "riderNameAR": "اسم السائق",
      "riderNameEN": "Rider Name",
      "housingName": "Housing Name",
      "companyName": "Keta",
      "orders": 50,
      "acceptedOrders": 48,
      "rejectedOrders": 2,
      "workingHours": 8
    }
  ]
}
```

## 4.14 Keta Cumulative Stats

```http
GET /api/Report/keta/cumulative-stats
```

Query params:

```txt
startDate: YYYY-MM-DD
endDate: YYYY-MM-DD
```

Expected response:

```json
{
  "startDate": "2026-06-01",
  "endDate": "2026-06-25",
  "summary": {
    "totalRiders": 100,
    "totalOrders": 5000,
    "totalShifts": 200
  },
  "housings": [
    {
      "housingId": 3,
      "housingName": "Housing Name",
      "totalRiders": 20,
      "totalOrders": 1000,
      "riders": [
        {
          "workingId": "W-001",
          "riderNameAR": "اسم السائق",
          "totalOrders": 200,
          "totalShifts": 10
        }
      ]
    }
  ]
}
```

## 4.15 Keta Yearly Validation

```http
GET /api/KetaValidation/shifts?from={from}&to={to}
```

Query params:

```txt
from: YYYY-MM-DD
to: YYYY-MM-DD
```

Expected response:

```json
{
  "from": "2026-01-01",
  "to": "2026-12-31",
  "summary": {
    "totalShifts": 10000,
    "validShifts": 9500,
    "invalidShifts": 500
  },
  "riders": [
    {
      "riderId": 55,
      "workingId": "W-001",
      "riderNameAR": "اسم السائق",
      "housingName": "Housing Name",
      "totalShifts": 200,
      "validShifts": 190,
      "invalidShifts": 10,
      "issues": []
    }
  ]
}
```

## 4.16 Import Keta Validation Shifts

```http
POST /api/KetaValidation/shifts/import?uploadedBy={uploadedBy}
```

Query params:

```txt
uploadedBy: string
```

Request:

```txt
multipart/form-data
file: .xlsx or .xls
```

Expected response:

```json
{
  "totalRecords": 1000,
  "createdCount": 950,
  "updatedCount": 30,
  "errorCount": 20,
  "errors": [
    {
      "row": 10,
      "workingId": "W-001",
      "message": "Invalid shift data"
    }
  ]
}
```

---

# 5. Company Finance

## 5.1 Company Finance Dashboard

Used in:

```txt
/admin/reports/dashboard
```

API route:

```http
GET /api/Dashboard/companies?StartDate={startDate}&EndDate={endDate}&CompanyId={companyId}
```

Query params:

```txt
StartDate: YYYY-MM-DD
EndDate: YYYY-MM-DD
CompanyId: number, optional
```

Request:

```txt
No body
```

Expected response:

```json
{
  "startDate": "2026-06-01",
  "endDate": "2026-06-25",
  "totalDays": 25,
  "totalCompanies": 2,
  "grandTotalOrders": 5000,
  "companies": [
    {
      "companyId": 1,
      "companyName": "Company Name",
      "totalOrders": 2500,
      "totalShifts": 300,
      "totalUniqueRiders": 80,
      "days": [
        {
          "date": "2026-06-25",
          "acceptedOrders": 120,
          "uniqueRiders": 30,
          "totalShifts": 35,
          "totalWorkingHours": 280
        }
      ]
    }
  ]
}
```

Frontend usage:

- Builds company order trend chart from `companies[].days[].acceptedOrders`.
- Builds unique riders trend chart from `companies[].days[].uniqueRiders`.
- Shows company table using:
  - `companyName`
  - `totalOrders`
  - `totalShifts`
  - `totalUniqueRiders`
  - `days[].date`
  - `days[].acceptedOrders`
  - `days[].uniqueRiders`
  - `days[].totalShifts`
  - `days[].totalWorkingHours`

## 5.2 Dashboard Overview

```http
GET /api/dashboard/overview
```

Expected response:

```json
{
  "orders": {
    "total": 5000,
    "today": 200
  },
  "riders": {
    "total": 100,
    "active": 90
  },
  "companies": {
    "totalCompanies": 10
  }
}
```

## 5.3 Orders By Company

```http
GET /api/dashboard/orders/by-company?year={year}&month={month}
```

Query params:

```txt
year: number
month: number
```

Expected response:

```json
[
  {
    "companyId": 1,
    "companyName": "Company Name",
    "orders": 1500
  }
]
```

## 5.4 Orders Trend

```http
GET /api/dashboard/orders/trend?months={months}
```

Query params:

```txt
months: number
```

Expected response:

```json
[
  {
    "year": 2026,
    "month": 6,
    "orders": 5000
  }
]
```

## 5.5 Daily Orders

```http
GET /api/dashboard/orders/daily?days={days}&companyId={companyId}
```

Query params:

```txt
days: number
companyId: number, optional
```

Expected response:

```json
[
  {
    "date": "2026-06-25",
    "orders": 200,
    "companyId": 1,
    "companyName": "Company Name"
  }
]
```

## 5.6 Top Riders

```http
GET /api/dashboard/riders/top?year={year}&month={month}&top={top}&companyId={companyId}
```

Query params:

```txt
year: number
month: number
top: number
companyId: number, optional
```

Expected response:

```json
[
  {
    "riderId": 55,
    "workingId": "W-001",
    "riderNameAR": "اسم السائق",
    "riderNameEN": "Rider Name",
    "companyName": "Company Name",
    "orders": 500
  }
]
```

## 5.7 Riders By Company

```http
GET /api/dashboard/riders/by-company
```

Expected response:

```json
[
  {
    "companyId": 1,
    "companyName": "Company Name",
    "riderCount": 80
  }
]
```

## 5.8 Company Performance Report

```http
GET /api/Report/company-performance
```

Common query params:

```txt
startDate: YYYY-MM-DD
endDate: YYYY-MM-DD
companyId: number, optional
```

Expected response:

```json
[
  {
    "companyId": 1,
    "companyName": "Company Name",
    "totalOrders": 5000,
    "totalRiders": 100,
    "averageOrdersPerRider": 50,
    "days": [
      {
        "date": "2026-06-25",
        "orders": 200,
        "riders": 30
      }
    ]
  }
]
```

## 5.9 Compare Company Periods

```http
GET /api/Report/compare-company-periods
```

Common query params:

```txt
companyId: number, optional
period1Start: YYYY-MM-DD
period1End: YYYY-MM-DD
period2Start: YYYY-MM-DD
period2End: YYYY-MM-DD
```

Expected response:

```json
{
  "period1": {
    "startDate": "2026-06-01",
    "endDate": "2026-06-10",
    "totalOrders": 1000,
    "totalRiders": 50
  },
  "period2": {
    "startDate": "2026-06-11",
    "endDate": "2026-06-20",
    "totalOrders": 1200,
    "totalRiders": 55
  },
  "difference": {
    "orders": 200,
    "ordersPercent": 20,
    "riders": 5,
    "ridersPercent": 10
  }
}
```

---

# 6. Supporting Lookup Endpoints Used By Accounting Screens

These are not accounting endpoints themselves, but accounting screens use them to populate forms.

## 6.1 Housing List

```http
GET /api/housing
```

Expected response:

```json
[
  {
    "id": 3,
    "name": "Housing Name"
  }
]
```

## 6.2 Vehicle List

```http
GET /api/vehicles
```

Expected response:

```json
[
  {
    "vehicleNumber": "VH-001",
    "plateNumberA": "ABC123",
    "plateNumberE": "123ABC",
    "vehicleType": "Car",
    "manufacturer": "Toyota"
  }
]
```

## 6.3 Rider List

```http
GET /api/rider
```

Expected response:

```json
[
  {
    "riderId": 55,
    "nameAR": "اسم السائق",
    "nameEN": "Rider Name",
    "workingId": "W-001",
    "iqamaNo": "1234567890",
    "housingAddress": "Housing Name"
  }
]
```

## 6.4 Company List

```http
GET /api/company/
```

Expected response:

```json
[
  {
    "id": 1,
    "name": "Company Name"
  }
]
```
