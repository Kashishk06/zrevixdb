# Z-RevixDB Quick Start Guide

## Installation

### Requirements
- Python 3.9 or higher
- No additional dependencies (pure stdlib)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/zrevixdb.git
   cd zrevixdb
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # On Linux/macOS:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install (optional, for CLI access):**
   ```bash
   pip install -e .
   ```

## Running the Server

### Method 1: Direct Python
```bash
python app.py
```

### Method 2: With Custom Admin Password
```bash
ZREVIX_ADMIN_PASSWORD=your-secure-password python app.py
```
(Windows PowerShell: `$env:ZREVIX_ADMIN_PASSWORD="your-secure-password"`)

### Method 3: Using CLI Entry Point (if installed)
```bash
zrevixdb
```

## First Time Setup

On first run, the app will:
1. ✅ Create `zrevixdb.sqlite3` database
2. ✅ Initialize schema (5 tables)
3. ✅ Generate or use provided admin password
4. ✅ Print credentials to console (save these!)
5. ✅ Run crash recovery scan
6. ✅ Start HTTP server on `http://127.0.0.1:8000`

**Example output:**
```
======================================================================
  ______     _____            _      _____  ____  
 |___  /    |  __ \          (_)    |  __ \|  _ \ 
    / /____ | |__) |_____   ___  ___| |  | | |_) |
   / /______|  _  // _ \ \ / / |/ __| |  | |  _ < 
  / /__     | | \ \  __/\ V /| | (__| |__| | |_) |
 /_____|    |_|  \_\___| \_/ |_|\___|_____/|____/ 

  Enterprise Data Versioning & Time-Travel Platform
  [Zero Third-Party Dependencies • Python 3 Stdlib]
======================================================================

[*] Booting Z-RevixDB Engine...

======================================================
 [!] INITIAL ADMIN ACCOUNT CREATED
     Username : admin
     Password : your-generated-password
     Role     : Admin
 [!] Please store these credentials safely.
======================================================

[*] Starting HTTP server on http://127.0.0.1:8000 ...
```

## Accessing the Web Interface

Open your browser and navigate to:

| Feature | URL |
|---------|-----|
| 🏠 **Dashboard** (Control Center) | http://127.0.0.1:8000/dashboard.html |
| 📋 **Records & Lineage** | http://127.0.0.1:8000/records.html |
| ⏳ **Timeline** (Version History) | http://127.0.0.1:8000/timeline.html |
| 🔍 **Diff & Compare** | http://127.0.0.1:8000/compare.html |
| 🔎 **Search** (Full-Text) | http://127.0.0.1:8000/search.html |
| 🛡️ **Integrity Monitor** | http://127.0.0.1:8000/integrity.html |
| 📊 **Audit Trail** | http://127.0.0.1:8000/audit.html |
| ⚙️ **Settings** | http://127.0.0.1:8000/settings.html |

## Basic Operations

### 1. Login
- Navigate to login page (auto-redirect if not authenticated)
- Enter admin credentials
- Click "Authenticate"

### 2. Create a Record
- Go to **Records & Lineage** → **+ New Record**
- Select/create a collection (e.g., "users", "products")
- Enter a unique key (e.g., "user:123")
- Paste JSON data
- Click **Save** (creates Version 1)

**Example:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active"
}
```

### 3. Update a Record
- Find the record in **Records & Lineage**
- Click on it to open detail view
- Click **Edit**
- Modify JSON
- Click **Save** (creates new Version 2)

### 4. Compare Versions
- Go to **Diff & Compare**
- Select record and two version numbers
- Click **Compare**
- View field-level changes (added/removed/changed)

### 5. Restore an Old Version
- Go to **Timeline** or record detail view
- Click on a past version node
- Click **Restore this version**
- Confirmation saves it as a new version

### 6. Search Records
- Go to **Search**
- Enter keywords
- Results sorted by relevance
- Click to view matching records

### 7. Verify Integrity
- Go to **Integrity Monitor**
- Click **Run Check**
- System verifies HMAC-SHA256 signatures
- Reports any tampering detected

### 8. Review Audit Trail
- Go to **Audit Trail**
- Filter by user, action, record, or date
- View complete history of all operations

## Running Tests

```bash
# Run all tests
python -m unittest discover tests

# Run specific test module
python -m unittest tests.test_auth

# With verbose output
python -m unittest discover tests -v
```

**Current Status:** ✅ 31/31 tests passing

## Configuration

### Environment Variables
- `ZREVIX_ADMIN_PASSWORD` - Set initial admin password
- `ZREVIXDB_PATH` - Override database location (default: `./zrevixdb.sqlite3`)

### Server Settings
Edit `app.py` to change:
- `host` - Listening address (default: `127.0.0.1`)
- `port` - Listening port (default: `8000`)

## Project Structure

```
zrevixdb/
├── app.py                    # Application entry point
├── requirements.txt          # Dependencies (empty - stdlib only!)
├── README.md                 # Main documentation
├── LICENSE                   # MIT License
├── setup.py                  # Package configuration
├── CONTRIBUTING.md           # Contribution guide
├── ARCHITECTURE.md           # System architecture
├── QUICKSTART.md             # This file
├── STDLIB.md                 # Standard library usage
│
├── zrevixdb/                 # Python package
│   ├── __init__.py
│   ├── server.py             # HTTP server & router
│   ├── storage.py            # SQLite interface
│   ├── auth.py               # Authentication & RBAC
│   ├── versioning.py         # CRUD & version management
│   ├── diff.py               # Version diffing
│   ├── integrity.py          # Cryptographic verification
│   ├── search.py             # Full-text search
│   ├── audit.py              # Audit logging
│   ├── recovery.py           # Crash recovery
│   └── dashboard.py          # Stats aggregation
│
├── static/                   # Frontend assets
│   ├── *.html                # Web pages
│   ├── css/style.css         # Styling
│   ├── js/app.js             # Client-side logic
│   └── images/               # Logo & media
│
├── tests/                    # Unit tests
│   ├── test_auth.py
│   ├── test_search.py
│   ├── test_versioning.py
│   └── ...
│
└── .gitignore               # Git ignore rules
```

## Stopping the Server

Press `Ctrl+C` in the terminal to gracefully shut down the server.

## Common Issues

### "Address already in use"
Another process is using port 8000. Change port in `app.py` or kill the other process.

### "Database is locked"
Restart the server. Z-RevixDB uses WAL mode which handles concurrent access well.

### Login fails
- Check admin credentials
- Verify database file exists (`zrevixdb.sqlite3`)
- Check server console for auth errors

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Explore the code in `zrevixdb/` package
- Check tests in `tests/` for usage examples

## Help & Support

- 📖 See README.md for detailed documentation
- 🐛 Report issues on GitHub
- 💬 Discuss in GitHub Discussions

Happy versioning! 🚀
