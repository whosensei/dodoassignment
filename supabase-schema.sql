-- Supabase Schema for Dodo Payments Integration

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create customers table to map Supabase users to Dodo customers
create table customers (
  id uuid primary key references auth.users(id) on delete cascade,
  dodo_customer_id text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create subscription_events table to store webhook events
create table subscription_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  payload jsonb not null,
  subscription_id text,
  product_id text,
  customer_id uuid references customers(id) on delete cascade,
  created_at timestamp default now()
);

-- Create subscriptions table to track subscription state 
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  dodo_subscription_id text unique not null,
  dodo_customer_id text not null,
  product_id text not null,
  billing_currency text,
  current_period_start timestamp,
  current_period_end timestamp,
  next_billing_date timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create user_profiles table for additional user information
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Add indexes for better performance
create index idx_customers_dodo_id on customers(dodo_customer_id);
create index idx_subscription_events_type on subscription_events(event_type);
create index idx_subscription_events_created on subscription_events(created_at);
create index idx_subscriptions_dodo_id on subscriptions(dodo_subscription_id);
create index idx_subscriptions_customer_id on subscriptions(dodo_customer_id);
create index idx_user_profiles_email on user_profiles(email);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_customers_updated_at before update on customers
  for each row execute function update_updated_at_column();

create trigger update_user_profiles_updated_at before update on user_profiles
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at before update on subscriptions
  for each row execute function update_updated_at_column();

-- Row Level Security (RLS) policies
alter table customers enable row level security;
alter table subscription_events enable row level security;
alter table subscriptions enable row level security;
alter table user_profiles enable row level security;

-- Customers table policies
create policy "Users can view their own customer data" on customers
  for select using (auth.uid() = id);

create policy "Service role can manage all customer data" on customers
  for all using (auth.role() = 'service_role');

-- Subscription events policies
create policy "Service role can manage all subscription events" on subscription_events
  for all using (auth.role() = 'service_role');

-- Subscriptions policies
create policy "Service role can manage all subscriptions" on subscriptions
  for all using (auth.role() = 'service_role');

-- User profiles policies
create policy "Users can view their own profile" on user_profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on user_profiles
  for update using (auth.uid() = id);

create policy "Service role can manage all user profiles" on user_profiles
  for all using (auth.role() = 'service_role');
