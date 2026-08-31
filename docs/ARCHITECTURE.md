# Z-RevixDB Architecture

## System Overview

Z-RevixDB is an enterprise-grade data versioning platform built entirely with Python 3 standard library (zero third-party dependencies at runtime).

## Architecture Layers

### 1. **Frontend Layer** (`static/`)
- **Technology:** Vanilla HTML5, CSS3, JavaScript (no frameworks)
- **Pages:**
  - `dashboard.html` - Control center with live stats
  - `records.html` - Record CRUD operations
  - `timeline.html` - Visual version timeline
  - `compare.html` - Diff & compare versions
  - `search.html` - Full-text search interface
  - `integrity.html` - Cryptographic verification
  - `audit.html` - Audit trail viewer
  - `settings.html` - User & system settings
  - `login.html` - Authentication

### 2. **HTTP Server Layer** (`zrevixdb/server.py`)
- **Framework:** Python's `http.server.ThreadingHTTPServer`
- **Router:** Custom regex-based path matcher
- **Static File Handler:** Built-in support for CSS, JS, images
- **Session Management:** HttpOnly cookies with server-side validation

### 3. **Application Layer** (`zrevixdb/`)
Core modules organized by feature:

| Module | Purpose |
|--------|---------|
| `auth.py` | PBKDF2-HMAC-SHA256 authentication, RBAC, sessions |
| `storage.py` | SQLite connection, schema management, WAL mode |
| `versioning.py` | Immutable CRUD, time-travel, restore operations |
| `diff.py` | Field-level version diffing with set operations |
| `integrity.py` | HMAC-SHA256 signing & verification |
| `search.py` | Custom inverted index, full-text search |
| `audit.py` | Structured audit log with filtering |
| `recovery.py` | Pre-flight crash recovery scan |
| `dashboard.py` | Live stats aggregation & reporting |

### 4. **Storage Layer** (`zrevixdb/storage.py`)
- **Database:** SQLite with WAL (Write-Ahead Logging) mode
- **Tables:**
  - `users` - Account management
  - `sessions` - Active session tokens
  - `records` - Current record state
  - `record_versions` - All historical versions
  - `audit_log` - Complete action history

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT (Browser)                                                    │
│  Vanilla JS fetch() → HTTP/JSON                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│  HTTP Layer (server.py)                                              │
│  ThreadingHTTPServer + Router + Static File Handler                 │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│  Application Layer                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ auth.py      │ │ versioning.py│ │ search.py    │ │ integrity.py│ │
│  │ (RBAC)       │ │ (CRUD)       │ │ (FTS Index)  │ │ (HMAC)     │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ diff.py      │ │ audit.py     │ │ recovery.py  │                │
│  │ (Diffing)    │ │ (Audit Log)  │ │ (Crash Scan) │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                    Parameterized SQL
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│  Storage Layer (storage.py)                                          │
│  SQLite Database (WAL mode)                                          │
│  users | sessions | records | record_versions | audit_log           │
└──────────────────────────────────────────────────────────────────────┘
```

## Key Design Patterns

### 1. **Immutable Versioning**
- Every create/update appends a new version row
- Nothing is ever overwritten or deleted
- Soft-deletes are tombstone versions

### 2. **Cryptographic Integrity**
- Each version signed with HMAC-SHA256 at write time
- Server-held secret key in `.zrevix_secret.key`
- Boot-time scan verifies all signatures

### 3. **Role-Based Access Control (RBAC)**
- Four roles: Admin, Manager, Auditor, Viewer
- Per-route permission checks
- Audit log entry for every permission denial

### 4. **Full-Text Search**
- Custom inverted index built from record fields
- Tokens → record ID mapping
- Simple relevance scoring (no external service)

### 5. **Crash Recovery**
- Pre-flight scan on every boot
- Schema verification
- Index rebuild
- Server doesn't start until recovery succeeds

## Security Considerations

1. **Password Hashing:** PBKDF2-HMAC-SHA256 (per-user salt)
2. **Sessions:** HttpOnly cookies, no JavaScript access
3. **Audit Trail:** Complete logging of all sensitive actions
4. **Data Integrity:** HMAC signatures prevent tampering
5. **SQL Injection:** Parameterized queries throughout
6. **CORS:** Server-side authentication required for all endpoints

## Deployment Notes

- **Single File Binary:** Entire app can run from `zrevixdb.py`
- **No External Dependencies:** All standard library
- **Platform Agnostic:** Works on Linux, macOS, Windows
- **Database Location:** Configurable via environment variable
- **Admin Password:** Configurable via `ZREVIX_ADMIN_PASSWORD` env var

## Performance Characteristics

- **Startup Time:** ~100ms (crash recovery scan)
- **Query Performance:** O(n) for full record scans, O(1) for record by ID
- **Search Performance:** O(k) where k = number of tokens in query
- **Concurrency:** ThreadingHTTPServer handles multiple clients
- **Storage Efficiency:** SQLite WAL mode, no bloat from versioning

## Testing Strategy

- **Unit Tests:** `tests/test_*.py` with temporary databases
- **Coverage:** Auth, CRUD, versioning, diffing, search, integrity, recovery
- **Test Isolation:** Each test gets fresh database, no side effects
- **Current Status:** 31/31 tests passing

## Future Extensibility

- Plugin system for custom integrity checks
- Custom audit event types
- Bulk import/export utilities
- Webhook support for version changes
- GraphQL API layer (on top of REST)
