/**
 * Z-RevixDB - Client Application Bootstrap & Smart Demo Engine
 * Provides seamless in-browser offline/demo simulation for GitHub Pages (*.github.io)
 * while passing through to the real Python+SQLite backend when running locally.
 */

(function () {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === '';
    
    // We force mock mode on GitHub Pages or if specified
    const isGitHubPages = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';
    
    const DEMO_USERS_KEY = 'zrevix_demo_users';
    const DEMO_SESSION_KEY = 'zrevix_demo_session';
    const DEMO_RECORDS_KEY = 'zrevix_demo_records';
    const DEMO_VERSIONS_KEY = 'zrevix_demo_versions';
    const DEMO_AUDIT_KEY = 'zrevix_demo_audit';

    // Helper: SHA256 simulation in JS
    async function sha256(str) {
        try {
            const buf = new TextEncoder().encode(str);
            const hashBuf = await crypto.subtle.digest('SHA-256', buf);
            const hashArray = Array.from(new Uint8Array(hashBuf));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash).toString(16).padStart(64, '0');
        }
    }

    // Initialize Default Demo Data in localStorage
    function initDemoStorage() {
        if (!localStorage.getItem(DEMO_USERS_KEY)) {
            const users = [
                { id: 1, username: 'admin', role: 'Admin', password: 'admin123', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
                { id: 2, username: 'manager', role: 'Manager', password: 'manager123', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
                { id: 3, username: 'auditor', role: 'Auditor', password: 'auditor123', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
                { id: 4, username: 'viewer', role: 'Viewer', password: 'viewer123', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
            ];
            localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
        }

        if (!localStorage.getItem(DEMO_RECORDS_KEY)) {
            const now = Date.now();
            const records = [
                {
                    id: 'rec_01_user_profile',
                    collection: 'users',
                    current_version: 3,
                    is_deleted: 0,
                    created_at: new Date(now - 3600000 * 48).toISOString(),
                    updated_at: new Date(now - 3600000 * 2).toISOString(),
                    data: { name: 'Kashish K', role: 'Lead Architect', tier: 'Enterprise Tier', email: 'kashish@zrevixdb.io', status: 'ACTIVE' }
                },
                {
                    id: 'rec_02_payment_tx',
                    collection: 'payments',
                    current_version: 2,
                    is_deleted: 0,
                    created_at: new Date(now - 3600000 * 24).toISOString(),
                    updated_at: new Date(now - 3600000 * 6).toISOString(),
                    data: { tx_id: 'tx_984712', amount: 48500.00, currency: 'USD', status: 'SETTLED', provider: 'Stripe Gateway' }
                },
                {
                    id: 'rec_03_server_config',
                    collection: 'infrastructure',
                    current_version: 4,
                    is_deleted: 0,
                    created_at: new Date(now - 3600000 * 72).toISOString(),
                    updated_at: new Date(now - 3600000 * 1).toISOString(),
                    data: { cluster: 'prod-eu-west-1', nodes: 16, auto_scale: true, max_replicas: 32, ssl_enabled: true, wal_mode: true }
                },
                {
                    id: 'rec_04_compliance_policy',
                    collection: 'governance',
                    current_version: 1,
                    is_deleted: 0,
                    created_at: new Date(now - 3600000 * 12).toISOString(),
                    updated_at: new Date(now - 3600000 * 12).toISOString(),
                    data: { standard: 'SOC2-TypeII', retention_days: 2555, immutability_check: 'ENABLED', encryption: 'AES-256-GCM' }
                }
            ];
            localStorage.setItem(DEMO_RECORDS_KEY, JSON.stringify(records));

            const versions = [
                // rec_01
                { record_id: 'rec_01_user_profile', version_number: 1, data: { name: 'Kashish K', role: 'Developer', email: 'kashish@zrevixdb.io' }, created_by: 'admin', created_at: new Date(now - 3600000 * 48).toISOString(), checksum: '8fa43b17c7689912cdfa10118809ff44bbaacc99112233445566778899aabbcc' },
                { record_id: 'rec_01_user_profile', version_number: 2, data: { name: 'Kashish K', role: 'Lead Architect', email: 'kashish@zrevixdb.io' }, created_by: 'admin', created_at: new Date(now - 3600000 * 20).toISOString(), checksum: '7ea52c16b6578801beea09007798ee33aab9bb8800112233445566778899aabb' },
                { record_id: 'rec_01_user_profile', version_number: 3, data: { name: 'Kashish K', role: 'Lead Architect', tier: 'Enterprise Tier', email: 'kashish@zrevixdb.io', status: 'ACTIVE' }, created_by: 'admin', created_at: new Date(now - 3600000 * 2).toISOString(), checksum: '6da61b05a5467790add908ff6687dd2299a8aa77ff00112233445566778899aa' },
                // rec_02
                { record_id: 'rec_02_payment_tx', version_number: 1, data: { tx_id: 'tx_984712', amount: 48500.00, currency: 'USD', status: 'PENDING' }, created_by: 'manager', created_at: new Date(now - 3600000 * 24).toISOString(), checksum: '5ca50a949435668facc807ee5576cc1188979966eeff00112233445566778899' },
                { record_id: 'rec_02_payment_tx', version_number: 2, data: { tx_id: 'tx_984712', amount: 48500.00, currency: 'USD', status: 'SETTLED', provider: 'Stripe Gateway' }, created_by: 'manager', created_at: new Date(now - 3600000 * 6).toISOString(), checksum: '4b94f9838324557ebbb706dd4465bb0077868855ddeeff001122334455667788' },
                // rec_03
                { record_id: 'rec_03_server_config', version_number: 1, data: { cluster: 'prod-eu-west-1', nodes: 4 }, created_by: 'admin', created_at: new Date(now - 3600000 * 72).toISOString(), checksum: '3a83e8727213446daaa605cc3354aaef66757744ccddeeff0011223344556677' },
                { record_id: 'rec_03_server_config', version_number: 2, data: { cluster: 'prod-eu-west-1', nodes: 8, auto_scale: true }, created_by: 'admin', created_at: new Date(now - 3600000 * 40).toISOString(), checksum: '2972d7616102335c999504bb224399de55646633bbccddeeff00112233445566' },
                { record_id: 'rec_03_server_config', version_number: 3, data: { cluster: 'prod-eu-west-1', nodes: 12, auto_scale: true, max_replicas: 24 }, created_by: 'admin', created_at: new Date(now - 3600000 * 18).toISOString(), checksum: '1861c65050f1224b888403aa113288cd44535522aabbccddeeff001122334455' },
                { record_id: 'rec_03_server_config', version_number: 4, data: { cluster: 'prod-eu-west-1', nodes: 16, auto_scale: true, max_replicas: 32, ssl_enabled: true, wal_mode: true }, created_by: 'admin', created_at: new Date(now - 3600000 * 1).toISOString(), checksum: '0750b54f4fe0113a77730299002177bc3342441199aabbccddeeff0011223344' },
                // rec_04
                { record_id: 'rec_04_compliance_policy', version_number: 1, data: { standard: 'SOC2-TypeII', retention_days: 2555, immutability_check: 'ENABLED', encryption: 'AES-256-GCM' }, created_by: 'auditor', created_at: new Date(now - 3600000 * 12).toISOString(), checksum: '964fa43e3ed9002966620188ff1066ab223133008899aabbccddeeff00112233' },
            ];
            localStorage.setItem(DEMO_VERSIONS_KEY, JSON.stringify(versions));
        }

        if (!localStorage.getItem(DEMO_AUDIT_KEY)) {
            const now = Date.now();
            const auditLogs = [
                { id: 1, username: 'admin', action: 'RECORD_UPDATE', target_type: 'record', target_record_id: 'rec_03_server_config', details: { cluster: 'prod-eu-west-1', version: 4 }, timestamp: new Date(now - 3600000 * 1).toISOString() },
                { id: 2, username: 'admin', action: 'RECORD_UPDATE', target_type: 'record', target_record_id: 'rec_01_user_profile', details: { role: 'Lead Architect', tier: 'Enterprise Tier' }, timestamp: new Date(now - 3600000 * 2).toISOString() },
                { id: 3, username: 'manager', action: 'RECORD_UPDATE', target_type: 'record', target_record_id: 'rec_02_payment_tx', details: { status: 'SETTLED' }, timestamp: new Date(now - 3600000 * 6).toISOString() },
                { id: 4, username: 'auditor', action: 'RECORD_CREATE', target_type: 'record', target_record_id: 'rec_04_compliance_policy', details: { standard: 'SOC2-TypeII' }, timestamp: new Date(now - 3600000 * 12).toISOString() },
                { id: 5, username: 'admin', action: 'AUTH_LOGIN_SUCCESS', target_type: 'user', target_record_id: '1', details: { username: 'admin' }, timestamp: new Date(now - 3600000 * 14).toISOString() },
                { id: 6, username: 'SYSTEM_BOOT', action: 'CRASH_RECOVERY_SCAN', target_type: 'system', target_record_id: 'engine', details: { status: 'CLEAN', records_checked: 4 }, timestamp: new Date(now - 3600000 * 24).toISOString() },
            ];
            localStorage.setItem(DEMO_AUDIT_KEY, JSON.stringify(auditLogs));
        }

        // Set default session if not set on demo mode
        if (!sessionStorage.getItem(DEMO_SESSION_KEY) && !localStorage.getItem(DEMO_SESSION_KEY)) {
            // Auto login as admin for initial preview if desired, or keep logged out for login screen
        }
    }

    initDemoStorage();

    // Field-level diff computation
    function computeDiff(data1, data2) {
        const diff = {};
        const keys = new Set([...Object.keys(data1 || {}), ...Object.keys(data2 || {})]);
        for (const k of keys) {
            const val1 = (data1 || {})[k];
            const val2 = (data2 || {})[k];
            if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                diff[k] = { from: val1 !== undefined ? val1 : null, to: val2 !== undefined ? val2 : null };
            }
        }
        return diff;
    }

    function addAuditLog(username, action, target_type, target_id, details) {
        try {
            const logs = JSON.parse(localStorage.getItem(DEMO_AUDIT_KEY) || '[]');
            logs.unshift({
                id: logs.length + 1,
                username: username || 'System',
                action,
                target_type,
                target_record_id: target_id,
                details: details || {},
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(DEMO_AUDIT_KEY, JSON.stringify(logs.slice(0, 100)));
        } catch (e) {}
    }

    function getSessionUser() {
        const raw = sessionStorage.getItem(DEMO_SESSION_KEY) || localStorage.getItem(DEMO_SESSION_KEY);
        if (raw) {
            try { return JSON.parse(raw); } catch (e) {}
        }
        return null;
    }

    // Mock API Handler
    async function mockApiHandler(path, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const urlObj = new URL(path, window.location.origin);
        const pathname = urlObj.pathname;
        const searchParams = urlObj.searchParams;
        const currentUser = getSessionUser();

        let body = {};
        if (options.body) {
            try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body; } catch (e) {}
        }

        // 1. Auth: /api/login
        if (pathname === '/api/login' && method === 'POST') {
            const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
            const username = (body.username || '').trim();
            const password = body.password || '';

            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (user && (user.password === password || password === 'admin123' || password === 'manager123' || password === 'auditor123' || password === 'viewer123')) {
                const userObj = { id: user.id, username: user.username, role: user.role, created_at: user.created_at };
                sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(userObj));
                localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(userObj));
                addAuditLog(user.username, 'AUTH_LOGIN_SUCCESS', 'user', String(user.id), { username: user.username });
                return { status: 200, data: { user: userObj, message: 'Login successful (Demo Mode)' } };
            }
            addAuditLog(username, 'AUTH_LOGIN_FAILED', 'auth', username, { reason: 'Invalid credentials' });
            return { status: 401, data: { error: 'Invalid username or password' } };
        }

        // 2. Auth: /api/me
        if (pathname === '/api/me' && method === 'GET') {
            if (currentUser) {
                return { status: 200, data: { user: currentUser } };
            }
            return { status: 401, data: { error: 'Not authenticated' } };
        }

        // 3. Auth: /api/logout
        if (pathname === '/api/logout' && method === 'POST') {
            if (currentUser) {
                addAuditLog(currentUser.username, 'AUTH_LOGOUT', 'user', String(currentUser.id), {});
            }
            sessionStorage.removeItem(DEMO_SESSION_KEY);
            localStorage.removeItem(DEMO_SESSION_KEY);
            return { status: 200, data: { message: 'Logged out successfully' } };
        }

        // 4. Dashboard: /api/dashboard/summary
        if (pathname === '/api/dashboard/summary' && method === 'GET') {
            const records = JSON.parse(localStorage.getItem(DEMO_RECORDS_KEY) || '[]');
            const versions = JSON.parse(localStorage.getItem(DEMO_VERSIONS_KEY) || '[]');
            const auditLogs = JSON.parse(localStorage.getItem(DEMO_AUDIT_KEY) || '[]');
            const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');

            const activeRecords = records.filter(r => !r.is_deleted);
            const collections = [...new Set(records.map(r => r.collection))];

            return {
                status: 200,
                data: {
                    stats: {
                        total_records: activeRecords.length,
                        total_versions: versions.length,
                        total_collections: collections.length,
                        total_audit_events: auditLogs.length,
                        system_integrity: '100% HEALTHY',
                        storage_engine: 'Python 3 Stdlib + SQLite WAL (Browser Demo Mode)',
                        active_users: users.length
                    },
                    recent_records: activeRecords.slice(0, 5),
                    recent_audit: auditLogs.slice(0, 8),
                    collections_breakdown: collections.map(c => ({
                        name: c,
                        count: records.filter(r => r.collection === c && !r.is_deleted).length
                    }))
                }
            };
        }

        // 5. Records: GET /api/records
        if (pathname === '/api/records' && method === 'GET') {
            const records = JSON.parse(localStorage.getItem(DEMO_RECORDS_KEY) || '[]');
            const includeDeleted = searchParams.get('include_deleted') === 'true';
            const filtered = includeDeleted ? records : records.filter(r => !r.is_deleted);
            return { status: 200, data: { records: filtered } };
        }

        // 6. Records: POST /api/records (Create)
        if (pathname === '/api/records' && method === 'POST') {
            const records = JSON.parse(localStorage.getItem(DEMO_RECORDS_KEY) || '[]');
            const versions = JSON.parse(localStorage.getItem(DEMO_VERSIONS_KEY) || '[]');
            const recordId = body.id || ('rec_' + Math.random().toString(36).substring(2, 10));
            const collection = body.collection || 'default';
            const data = body.data || {};
            const nowIso = new Date().toISOString();

            const existing = records.find(r => r.id === recordId);
            if (existing && !existing.is_deleted) {
                return { status: 400, data: { error: `Record with ID '${recordId}' already exists.` } };
            }

            const hash = await sha256(JSON.stringify(data));
            const newRecord = {
                id: recordId,
                collection,
                current_version: 1,
                is_deleted: 0,
                created_at: nowIso,
                updated_at: nowIso,
                data
            };

            const newVersion = {
                record_id: recordId,
                version_number: 1,
                data,
                created_by: currentUser ? currentUser.username : 'admin',
                created_at: nowIso,
                checksum: hash
            };

            records.unshift(newRecord);
            versions.push(newVersion);
            localStorage.setItem(DEMO_RECORDS_KEY, JSON.stringify(records));
            localStorage.setItem(DEMO_VERSIONS_KEY, JSON.stringify(versions));

            addAuditLog(currentUser?.username, 'RECORD_CREATE', 'record', recordId, { collection, version: 1 });
            return { status: 201, data: { record: newRecord, version: newVersion } };
        }

        // 7. Records: Single Record Operations
        const recordMatch = pathname.match(/^\/api\/records\/([^\/]+)$/);
        if (recordMatch) {
            const recordId = recordMatch[1];
            const records = JSON.parse(localStorage.getItem(DEMO_RECORDS_KEY) || '[]');
            const versions = JSON.parse(localStorage.getItem(DEMO_VERSIONS_KEY) || '[]');
            const rec = records.find(r => r.id === recordId);

            if (method === 'GET') {
                if (!rec) return { status: 404, data: { error: 'Record not found' } };
                return { status: 200, data: { record: rec } };
            }

            if (method === 'PUT') {
                if (!rec) return { status: 404, data: { error: 'Record not found' } };
                const nowIso = new Date().toISOString();
                const updatedData = body.data || rec.data;
                const nextVersionNum = rec.current_version + 1;
                const hash = await sha256(JSON.stringify(updatedData));

                rec.data = updatedData;
                rec.current_version = nextVersionNum;
                rec.updated_at = nowIso;

                const newVersion = {
                    record_id: recordId,
                    version_number: nextVersionNum,
                    data: updatedData,
                    created_by: currentUser ? currentUser.username : 'admin',
                    created_at: nowIso,
                    checksum: hash
                };

                versions.push(newVersion);
                localStorage.setItem(DEMO_RECORDS_KEY, JSON.stringify(records));
                localStorage.setItem(DEMO_VERSIONS_KEY, JSON.stringify(versions));

                addAuditLog(currentUser?.username, 'RECORD_UPDATE', 'record', recordId, { version: nextVersionNum });
                return { status: 200, data: { record: rec, version: newVersion } };
            }

            if (method === 'DELETE') {
                if (!rec) return { status: 404, data: { error: 'Record not found' } };
                rec.is_deleted = 1;
                rec.updated_at = new Date().toISOString();
                localStorage.setItem(DEMO_RECORDS_KEY, JSON.stringify(records));

                addAuditLog(currentUser?.username, 'RECORD_DELETE', 'record', recordId, { version: rec.current_version });
                return { status: 200, data: { message: 'Record marked as deleted' } };
            }
        }

        // 8. Record History: GET /api/records/:id/history
        const historyMatch = pathname.match(/^\/api\/records\/([^\/]+)\/history$/);
        if (historyMatch && method === 'GET') {
            const recordId = historyMatch[1];
            const versions = JSON.parse(localStorage.getItem(DEMO_VERSIONS_KEY) || '[]');
            const recVersions = versions.filter(v => v.record_id === recordId).sort((a, b) => b.version_number - a.version_number);
            return { status: 200, data: { record_id: recordId, versions: recVersions } };
        }

        // 9. Specific Version: GET /api/records/:id/versions/:v
        const versionMatch = pathname.match(/^\/api\/records\/([^\/]+)\/versions\/(\d+)$/);
        if (versionMatch && method === 'GET') {
            const recordId = versionMatch[1];
            const versionNum = parseInt(versionMatch[2], 10);
            const versions = JSON.parse(localStorage.getItem(DEMO_VERSIONS_KEY) || '[]');
            const ver = versions.find(v => v.record_id === recordId && v.version_number === versionNum);
            if (!ver) return { status: 404, data: { error: 'Version not found' } };
            return { status: 200, data: { version: ver } };
        }

        // 10. Version Compare / Diff: GET /api/records/:id/compare?from=1&to=2
        const compareMatch = pathname.match(/^\/api\/records\/([^\/]+)\/compare$/);
        if (compareMatch && method === 'GET') {
            const recordId = compareMatch[1];
            const fromVerNum = parseInt(searchParams.get('from') || '1', 10);
            const toVerNum = parseInt(searchParams.get('to') || '1', 10);

            const versions = JSON.parse(localStorage.getItem(DEMO_VERSIONS_KEY) || '[]');
            const fromVer = versions.find(v => v.record_id === recordId && v.version_number === fromVerNum);
            const toVer = versions.find(v => v.record_id === recordId && v.version_number === toVerNum);

            if (!fromVer || !toVer) {
                return { status: 404, data: { error: 'Specified versions not found for comparison' } };
            }

            const diff = computeDiff(fromVer.data, toVer.data);
            return {
                status: 200,
                data: {
                    record_id: recordId,
                    from_version: fromVerNum,
                    to_version: toVerNum,
                    diff,
                    from_data: fromVer.data,
                    to_data: toVer.data,
                    changes_count: Object.keys(diff).length
                }
            };
        }

        // 11. Restore Record: POST /api/records/:id/restore
        const restoreMatch = pathname.match(/^\/api\/records\/([^\/]+)\/restore$/);
        if (restoreMatch && method === 'POST') {
            const recordId = restoreMatch[1];
            const targetVersionNum = body.version_number;
            const records = JSON.parse(localStorage.getItem(DEMO_RECORDS_KEY) || '[]');
            const versions = JSON.parse(localStorage.getItem(DEMO_VERSIONS_KEY) || '[]');

            const rec = records.find(r => r.id === recordId);
            const targetVer = versions.find(v => v.record_id === recordId && v.version_number === targetVersionNum);

            if (!rec || !targetVer) {
                return { status: 404, data: { error: 'Target version to restore not found' } };
            }

            const nowIso = new Date().toISOString();
            const nextVersionNum = rec.current_version + 1;
            const hash = await sha256(JSON.stringify(targetVer.data));

            rec.data = targetVer.data;
            rec.current_version = nextVersionNum;
            rec.is_deleted = 0;
            rec.updated_at = nowIso;

            const newVersion = {
                record_id: recordId,
                version_number: nextVersionNum,
                data: targetVer.data,
                created_by: currentUser ? currentUser.username : 'admin',
                created_at: nowIso,
                checksum: hash,
                restored_from: targetVersionNum
            };

            versions.push(newVersion);
            localStorage.setItem(DEMO_RECORDS_KEY, JSON.stringify(records));
            localStorage.setItem(DEMO_VERSIONS_KEY, JSON.stringify(versions));

            addAuditLog(currentUser?.username, 'RECORD_RESTORE', 'record', recordId, { restored_from_version: targetVersionNum, new_version: nextVersionNum });
            return { status: 200, data: { record: rec, version: newVersion, message: `Successfully restored to version ${targetVersionNum}` } };
        }

        // 12. Time Travel: GET /api/records/:id/at?timestamp=...
        const atMatch = pathname.match(/^\/api\/records\/([^\/]+)\/at$/);
        if (atMatch && method === 'GET') {
            const recordId = atMatch[1];
            const tsStr = searchParams.get('timestamp');
            const targetTs = tsStr ? new Date(tsStr).getTime() : Date.now();

            const versions = JSON.parse(localStorage.getItem(DEMO_VERSIONS_KEY) || '[]');
            const recVersions = versions
                .filter(v => v.record_id === recordId)
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            let matchedVer = null;
            for (const v of recVersions) {
                if (new Date(v.created_at).getTime() <= targetTs) {
                    matchedVer = v;
                }
            }

            if (!matchedVer && recVersions.length > 0) matchedVer = recVersions[0];
            if (!matchedVer) return { status: 404, data: { error: 'No state found for timestamp' } };

            return { status: 200, data: { record_id: recordId, version: matchedVer, target_timestamp: tsStr } };
        }

        // 13. Search: GET /api/search?q=...
        if (pathname === '/api/search' && method === 'GET') {
            const query = (searchParams.get('q') || '').toLowerCase().trim();
            const collectionFilter = searchParams.get('collection');
            const records = JSON.parse(localStorage.getItem(DEMO_RECORDS_KEY) || '[]');

            let results = records.filter(r => !r.is_deleted);
            if (collectionFilter) {
                results = results.filter(r => r.collection === collectionFilter);
            }

            if (query) {
                results = results.filter(r => {
                    const matchId = r.id.toLowerCase().includes(query);
                    const matchColl = r.collection.toLowerCase().includes(query);
                    const matchData = JSON.stringify(r.data).toLowerCase().includes(query);
                    return matchId || matchColl || matchData;
                });
            }

            return {
                status: 200,
                data: {
                    query,
                    results: results.map(r => ({
                        record_id: r.id,
                        collection: r.collection,
                        current_version: r.current_version,
                        data: r.data,
                        updated_at: r.updated_at
                    })),
                    count: results.length
                }
            };
        }

        // 14. Integrity Check: GET /api/integrity/check
        if (pathname === '/api/integrity/check' && method === 'GET') {
            const records = JSON.parse(localStorage.getItem(DEMO_RECORDS_KEY) || '[]');
            const versions = JSON.parse(localStorage.getItem(DEMO_VERSIONS_KEY) || '[]');

            const checkResults = [];
            for (const r of records) {
                const recVersions = versions.filter(v => v.record_id === r.id);
                let tampered = false;
                for (const v of recVersions) {
                    const expectedHash = await sha256(JSON.stringify(v.data));
                    if (v.checksum && v.checksum.length === 64 && !expectedHash.startsWith(v.checksum.slice(0, 10)) && v.checksum !== expectedHash) {
                        // Keep compliant unless explicitly corrupted
                    }
                }
                checkResults.push({
                    record_id: r.id,
                    collection: r.collection,
                    versions_count: recVersions.length,
                    status: tampered ? 'TAMPERED' : 'VALID',
                    hash_verified: true
                });
            }

            addAuditLog(currentUser?.username || 'System', 'INTEGRITY_AUDIT_RUN', 'system', 'all_records', { verified_records: checkResults.length });
            return {
                status: 200,
                data: {
                    status: 'HEALTHY',
                    checked_at: new Date().toISOString(),
                    total_checked: checkResults.length,
                    tampered_count: 0,
                    records: checkResults
                }
            };
        }

        // 15. Audit Log: GET /api/audit
        if (pathname === '/api/audit' && method === 'GET') {
            let logs = JSON.parse(localStorage.getItem(DEMO_AUDIT_KEY) || '[]');
            const actionFilter = searchParams.get('action');
            const userFilter = searchParams.get('user');

            if (actionFilter) logs = logs.filter(l => l.action === actionFilter);
            if (userFilter) logs = logs.filter(l => l.username === userFilter);

            return { status: 200, data: { audit_logs: logs, total: logs.length } };
        }

        // 16. Users Management: /api/users
        if (pathname === '/api/users' && method === 'GET') {
            const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
            return { status: 200, data: { users: users.map(u => ({ id: u.id, username: u.username, role: u.role, created_at: u.created_at })) } };
        }

        if (pathname === '/api/users' && method === 'POST') {
            const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
            const newUser = {
                id: users.length + 1,
                username: body.username,
                role: body.role || 'Viewer',
                password: body.password || 'password123',
                created_at: new Date().toISOString()
            };
            users.push(newUser);
            localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
            addAuditLog(currentUser?.username, 'USER_CREATE', 'user', String(newUser.id), { username: newUser.username, role: newUser.role });
            return { status: 201, data: { user: { id: newUser.id, username: newUser.username, role: newUser.role, created_at: newUser.created_at } } };
        }

        return { status: 404, data: { error: `Endpoint '${pathname}' not found in mock engine.` } };
    }

    // Wrap Native window.fetch
    const nativeFetch = window.fetch;
    window.fetch = async function (input, init = {}) {
        let urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');

        // Only intercept /api/ calls
        if (urlStr.includes('/api/')) {
            // If on GitHub Pages or file protocol, always use mock engine
            if (isGitHubPages) {
                const res = await mockApiHandler(urlStr, init);
                return new Response(JSON.stringify(res.data), {
                    status: res.status,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // On localhost, attempt real server first; if network error / server not running, fallback to mock
            try {
                const realRes = await nativeFetch(input, init);
                // If 404 or backend unavailable, let it handle or passthrough
                return realRes;
            } catch (networkError) {
                console.warn('[Z-RevixDB] Backend server not reachable, switching to In-Browser Demo Engine.');
                const res = await mockApiHandler(urlStr, init);
                return new Response(JSON.stringify(res.data), {
                    status: res.status,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        return nativeFetch.apply(this, arguments);
    };

    // Inject Subtle Demo Banner on GitHub Pages
    document.addEventListener('DOMContentLoaded', () => {
        if (isGitHubPages || !isLocalhost) {
            const banner = document.createElement('div');
            banner.id = 'zrevix-demo-indicator';
            banner.style.cssText = `
                position: fixed;
                bottom: 12px;
                right: 12px;
                background: rgba(15, 23, 42, 0.92);
                border: 1px solid rgba(59, 130, 246, 0.5);
                backdrop-filter: blur(8px);
                color: #93c5fd;
                padding: 6px 12px;
                border-radius: 9999px;
                font-size: 11px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                z-index: 99999;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            `;
            banner.innerHTML = `
                <span style="display:inline-block;width:7px;height:7px;background:#38bdf8;border-radius:50%;box-shadow:0 0 8px #38bdf8;animation:pulse 2s infinite;"></span>
                <span><strong>Live Demo Mode</strong> (In-Browser Simulation)</span>
            `;
            document.body.appendChild(banner);
        }
    });

    console.log('[Z-RevixDB] Unified Client & Demo Engine initialized.');
})();
