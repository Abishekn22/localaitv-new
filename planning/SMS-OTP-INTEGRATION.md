# 📱 SMS OTP Integration — 2Factor.in

Complete guide to wiring SMS-based OTP login into LocalAI TV using 2Factor.in.

---

## 🎯 What this gives you

- Users enter their **10-digit Indian mobile number**
- Backend sends a **6-digit OTP** via 2Factor.in (DLT-compliant)
- User enters OTP → backend verifies via 2Factor's session-based VERIFY API
- On success, app receives a **30-day auth token** (HMAC-signed)
- Failed attempts are tracked, rate-limited per phone (5/hour by default)

---

## 🛠 Architecture

```
┌─────────────────────┐                         ┌──────────────────────┐
│  React App (Phone)  │                         │  2Factor.in (DLT)    │
└─────────────────────┘                         └──────────────────────┘
        │                                                   ▲
        │ 1. POST /api/sms-otp-send                         │
        │    { phone: "9876543210" }                        │
        ▼                                                   │
┌─────────────────────┐    2. GET .../AUTOGEN              │
│  Netlify Functions  │ ─────────────────────────────────►  │
│  (your backend)     │ ◄───── { sessionId: "xyz..." } ────┤
└─────────────────────┘                                    │
        │                                                   │
        │ Returns: { sessionId: "xyz..." }                  │
        ▼                                                   │
┌─────────────────────┐                                    │
│  React App          │                                    │
└─────────────────────┘                                    │
   User reads SMS,                                         │
   enters OTP                                              │
        │                                                   │
        │ 3. POST /api/sms-otp-verify                       │
        │    { sessionId, otp: "123456" }                   │
        ▼                                                   │
┌─────────────────────┐    4. GET .../VERIFY/xyz/123456    │
│  Netlify Functions  │ ─────────────────────────────────► │
│  (your backend)     │ ◄───── { Status: "Success" } ──────┘
└─────────────────────┘
        │
        │ Returns: { authToken: "...", user: {...} }
        ▼
┌─────────────────────┐
│  React App          │ — store token in localStorage
└─────────────────────┘
```

---

## 🔑 Setup steps (one-time, ~15 min)

### 1. Get your 2Factor.in API key

1. Log in at https://2factor.in/CP/login.php
2. Go to **Dashboard → API Keys** (top menu)
3. Copy your API key (looks like: `f1e2d3c4-b5a6-7890-1234-567890abcdef`)

### 2. (Required for production) DLT registration

India's TRAI law requires DLT registration for all transactional/promotional SMS.
- Skip-able for **dev/testing** — 2Factor sends from a generic header
- **Required before going to prod** — uses your registered sender ID

To register:
1. Visit https://2factor.in/CP/dlt.php
2. Submit your business documents (PAN, GST, address proof)
3. Approve OTP template like: `Your LocalAI TV OTP is {#var#}. Valid for 10 min. Do not share.`
4. Get your **Template Name** (e.g. `LOCAITV_LOGIN`)
5. Get your **Sender ID** (6-letter brand, e.g. `LOCAIT`)

Timeline: 5–7 working days. Cost: ~₹5,000 one-time.

### 3. Set env vars in Netlify

Netlify Dashboard → **`localaitv-marketing` (or your site)** → Site settings → Environment variables → **Add a variable**:

| Variable | Value | Required? |
|---|---|---|
| `TWOFACTOR_API_KEY` | The API key from step 1 | ✅ Yes |
| `TWOFACTOR_TEMPLATE_NAME` | Your DLT template name (after step 2) | Optional in dev |
| `AUTH_TOKEN_SECRET` | 32+ random chars (generate: `openssl rand -hex 32`) | ✅ Yes |
| `SMS_OTP_RATE_PER_HOUR` | Max OTPs per phone per hour | Default: 5 |
| `ADMIN_TOKEN` | Your existing admin token (for /api/sms-balance) | (already set) |

After saving, **redeploy** the site so functions pick up the new vars.

### 4. Test from terminal

```bash
# Send OTP to your own phone first
curl -X POST https://YOUR-SITE.netlify.app/api/sms-otp-send \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Response: { "ok": true, "sessionId": "abc-xyz-...", "expiresIn": 600 }

# Verify the OTP you received
curl -X POST https://YOUR-SITE.netlify.app/api/sms-otp-verify \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "abc-xyz-...", "otp": "123456", "phone": "9876543210"}'

# Response: { "ok": true, "verified": true, "authToken": "eyJ...", "user": {...} }

# Check balance (admin only)
curl https://YOUR-SITE.netlify.app/api/sms-balance \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Response: { "ok": true, "sms": 245.5, "voice": 0 }
```

---

## 🎨 React app integration

Add this to your `App.jsx` (or wherever your login screen lives).

### Step 1 — Send OTP

```jsx
const API_BASE = '/api'; // or 'https://YOUR-SITE.netlify.app/api' for native builds

async function sendOTP(phone) {
  const r = await fetch(`${API_BASE}/sms-otp-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  const data = await r.json();
  if (!data.ok) {
    if (data.error === 'rate_limited') {
      alert(`Too many requests. Try again in ${Math.ceil(data.retryAfter/60)} min.`);
    } else if (data.error === 'invalid_phone') {
      alert('Invalid mobile number. Use a 10-digit Indian mobile.');
    } else {
      alert('Could not send OTP. Please try again.');
    }
    return null;
  }
  // Save sessionId for the verify step
  return data.sessionId;
}
```

### Step 2 — Verify OTP

```jsx
async function verifyOTP(sessionId, otp, phone) {
  const r = await fetch(`${API_BASE}/sms-otp-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, otp, phone })
  });
  const data = await r.json();
  if (!data.ok || !data.verified) {
    alert(data.userMessage || 'OTP verification failed');
    return null;
  }
  // Store the auth token for future authenticated requests
  localStorage.setItem('localaitv_auth_token', data.authToken);
  localStorage.setItem('localaitv_user', JSON.stringify(data.user));
  return data;
}
```

### Step 3 — Use the token

```jsx
async function callAuthenticated(endpoint, body) {
  const token = localStorage.getItem('localaitv_auth_token');
  return fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
```

### Step 4 — Complete login flow

```jsx
function LoginScreen() {
  const [phone, setPhone]         = useState('');
  const [otp, setOtp]             = useState('');
  const [sessionId, setSessionId] = useState('');
  const [step, setStep]           = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading]     = useState(false);

  async function onSendOtp() {
    setLoading(true);
    const sid = await sendOTP(phone);
    setLoading(false);
    if (sid) {
      setSessionId(sid);
      setStep('otp');
    }
  }

  async function onVerifyOtp() {
    setLoading(true);
    const result = await verifyOTP(sessionId, otp, phone);
    setLoading(false);
    if (result) {
      // Logged in — navigate to home
      window.location.href = '/';
    }
  }

  if (step === 'phone') {
    return (
      <div>
        <h2>Enter your mobile number</h2>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="9876543210"
          maxLength={10}
        />
        <button onClick={onSendOtp} disabled={loading || phone.length !== 10}>
          {loading ? 'Sending…' : 'Send OTP'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Enter the OTP sent to +91 {phone}</h2>
      <input
        type="tel"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        placeholder="6-digit OTP"
        maxLength={6}
      />
      <button onClick={onVerifyOtp} disabled={loading || otp.length < 4}>
        {loading ? 'Verifying…' : 'Verify'}
      </button>
      <button onClick={() => setStep('phone')}>Change number</button>
    </div>
  );
}
```

---

## 🛡 Security notes

- The auth token is **HMAC-signed** (not JWT) — minimal but secure enough for this app.
- For **revocation**, check the `user-sessions` Netlify Blob store and reject revoked sessions.
- Phone numbers are normalized (`+91...`) so dupes are caught.
- Rate limit is **per phone per hour** (default 5) — survives Netlify cold starts (uses Blobs).
- The OTP itself is never seen by the backend — 2Factor handles generation + delivery.
- 2Factor's session ID is **single-use** — verification consumes it.

---

## 💰 Cost (2Factor.in pricing as of 2026)

| What | Cost per SMS |
|---|---|
| Promotional SMS | ₹0.15 – ₹0.20 |
| Transactional SMS (DLT) | ₹0.20 – ₹0.25 |
| OTP via AUTOGEN | ₹0.25 |

For LocalAI TV — assume **1 OTP per user/month**:
- 1,000 users  →  ~₹250/month
- 10,000 users →  ~₹2,500/month
- 1 lakh users →  ~₹25,000/month

Top up at https://2factor.in/CP/recharge.php — pre-paid, no card auto-debits.

---

## 🚨 What to monitor

1. **Balance** — call `/api/sms-balance` from your admin dashboard daily.
   Alert if `sms < 1000` (enough for ~4 days at moderate volume).
2. **Failed OTP rate** — check Netlify Function logs. If >20% of `verify` calls fail,
   investigate (could be malicious enumeration).
3. **Rate-limit hits** — check `otp-rate-limit` blob entries. If many phones hit the limit,
   you may need to raise `SMS_OTP_RATE_PER_HOUR` or block specific numbers.

---

## 🔄 Resend logic (for the UI)

After sending an OTP, show a **60-second countdown** before allowing resend.
This prevents accidental double-sends (which would count against the rate limit).

```jsx
const [resendIn, setResendIn] = useState(0);

useEffect(() => {
  if (step === 'otp') setResendIn(60);
}, [step]);

useEffect(() => {
  if (resendIn <= 0) return;
  const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
  return () => clearTimeout(t);
}, [resendIn]);

// In the JSX:
<button onClick={onSendOtp} disabled={resendIn > 0}>
  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
</button>
```

---

## 📁 Files added to the repo

```
capacitor-project/netlify/functions/
  ├── sms-otp-send.mjs       (90 lines)
  ├── sms-otp-verify.mjs     (110 lines)
  └── sms-balance.mjs        (50 lines)
```

These get auto-deployed when the repo pushes to Netlify.

---

**Maintained by:** Nagarjuna Teddy ([balajikamireddy9@gmail.com](mailto:balajikamireddy9@gmail.com))
