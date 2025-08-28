# Dodo Assignment - Payment Integration

A Next.js app that integrates with Dodo Payments for subscription management.

## Install & Run Steps

### 1. Clone & Install
```bash
git clone https://github.com/whosensei/dodoassignment.git
cd dodoassn
pnpm install
# or
npm install
```

### 2. Environment Variables
Create `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Dodo Payments
DODO_API_KEY=your_dodo_api_key
DODO_BASE_URL=https://api.dodopayments.com
DODO_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Setup Database
- Create Supabase project at [supabase.com](https://supabase.com)
- Go to SQL Editor and run the contents of `supabase-schema.sql`
- Copy your project URL and keys from Settings → API

### 4. Deploy Webhook Function
```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy webhook function
supabase functions deploy webhook-handler

# Set required secrets
supabase secrets set DODO_WEBHOOK_SECRET=your_webhook_secret
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Run the App
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables Required

### Next.js App (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DODO_API_KEY=your_dodo_api_key
DODO_BASE_URL=https://api.dodopayments.com
DODO_WEBHOOK_SECRET=your_webhook_secret
```

### Supabase Edge Function (Secrets)
```bash
supabase secrets set DODO_WEBHOOK_SECRET=your_webhook_secret
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing Webhooks

### Webhook URL
```
https://your-project-ref.supabase.co/functions/v1/webhook-handler
```

**My Project URL**: https://qokgsfxecndqtvqrnxyl.supabase.co/functions/v1/webhook-handler

### Test with Real Platform Webhooks

The best way to test webhooks is to trigger real events from the Dodo platform. This ensures you're testing with actual webhook signatures and real data.

#### 1. Setup Webhook in Dodo Dashboard
1. Go to **Dodo Dashboard** → **Developer** → **Webhooks**
2. Click **"Add Webhook"**
3. Enter your webhook URL: `https://qokgsfxecndqtvqrnxyl.supabase.co/functions/v1/webhook-handler`
4. Save the webhook configuration

#### 2. Send Test Webhook
1. In the webhook settings, click **"Testing"**
2. Click **"Send Test Example"**
3. This will send a test webhook with valid signatures

#### 3. Monitor Webhook Events
1. Check your **Supabase dashboard** → **Table Editor** → `subscription_events`
2. You should see webhook events like:
   - `customer.created`
   - `subscription.created` 
   - `payment.succeeded`

#### 4. Check Webhook Logs
1. In Dodo Dashboard → **Developer** → **Webhooks**
2. Click on your webhook to view **logs**
3. Verify the webhook was sent successfully
4. Check response status and any error messages

#### 5. Expected Webhook Flow
```
Customer Created → Product Created → Subscription Created → Payment Succeeded
```

**Note**: Real webhooks from the platform will have valid signatures and will be processed successfully by the webhook handler.

### Local Testing (Next.js route)
Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your app
pnpm dev

# In another terminal
ngrok http 3000
```

Copy the ngrok URL and use it as your webhook endpoint in Dodo dashboard with /api/webhook.

## Project Structure

```
app/
├── api/           # API routes
│   ├── auth/      # Authentication endpoints
│   ├── products/  # Product management
│   ├── subscriptions/ # Subscription management
│   ├── user/      # User profile management
│   └── webhook/   # Legacy webhook route (fallback)
├── components/    # React components
│   ├── AuthForm.tsx
│   ├── Dashboard.tsx
│   ├── ProductCreation.tsx
│   ├── SubscriptionCreation.tsx
│   └── UserProfile.tsx
└── page.tsx       # Main page
lib/
├── dodoClient.ts      # Dodo client
└── supabaseClient.ts  # Supabase client
supabase/
└── functions/
    └── webhook-handler/  # Supabase Edge Function for webhooks
```

## Getting API Keys

- **Supabase**: Go to [supabase.com](https://supabase.com) → Create project → Settings → API
- **Dodo**: Go to [dodopayments.com](https://dodopayments.com) → API Keys section

## Deployment

### Edge Functions
```bash
# Deploy webhook function
supabase functions deploy webhook-handler

# Set secrets (required for production)
supabase secrets set DODO_WEBHOOK_SECRET=your_secret
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Update Dodo Webhook URL
In your Dodo dashboard, update the webhook endpoint to your deployed function URL:
```
https://your-project-ref.supabase.co/functions/v1/webhook-handler
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase Edge Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Dodo Payments API
- **Webhooks**: Standard Webhooks library

Timespent - started properly on Aug 28, barely surviving on dolo-650 🤒