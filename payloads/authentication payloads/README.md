# Authentication Payloads

This folder contains example JSON payloads for authentication endpoints.

## Available Payloads

### 1. login.json
Used for POST `/auth/login` endpoint for all user types (customers, drivers, admins).

**Required fields:**
- `email`: User's email address
- `password`: User's password

---

### 2. register-customer.json
Used for POST `/auth/register/customer` endpoint.

**Required fields:**
- `name`: Customer's full name
- `email`: Customer's email address
- `password`: Password (minimum 8 characters)
- `address`: Customer's delivery address

**Optional fields:**
- `role`: Customer role (defaults to "customer", can be "admin")
- `profile_image_url`: URL to profile image

---

### 3. register-driver.json
Used for POST `/auth/register/driver` endpoint.

**Required fields:**
- `name`: Driver's full name
- `email`: Driver's email address
- `password`: Password (minimum 8 characters)
- `phone`: Phone number (11 digits)
- `vehicle_type`: Vehicle type ("bike" or "car")

**Optional fields:**
- `profile_image_url`: URL to profile image

---

### 4. register-admin.json
Used for POST `/auth/register/admin` endpoint.

**Required fields:**
- `name`: Admin's full name
- `email`: Admin's email address
- `password`: Password (minimum 8 characters)
- `address`: Admin's address

**Optional fields:**
- `profile_image_url`: URL to profile image

---

## Usage Notes

- All passwords must be at least 8 characters long
- Email addresses must be valid email format
- Phone numbers for drivers must be exactly 11 digits
- Vehicle types are limited to: `bike` or `car`
- Customer roles can be: `customer` or `admin`
- Profile image URLs are optional for all user types
