-- E20 Real-Cost Fuel Dashboard — schema
-- All tables are read-only for the public: RLS is enabled with SELECT-only
-- policies for anon. Updates happen via the Supabase dashboard / service role.

create table cities (
  id         bigint generated always as identity primary key,
  name       text not null unique,
  state      text not null,
  -- Ad-valorem VAT rate applied to the pre-VAT sum, e.g. 0.194 for Delhi
  vat_rate   numeric(6, 4) not null check (vat_rate >= 0)
);

-- Daily retail pump quotes
create table fuel_prices (
  id            bigint generated always as identity primary key,
  city_id       bigint not null references cities (id) on delete cascade,
  date          date not null,
  petrol_retail numeric(8, 2) not null,
  diesel_retail numeric(8, 2),
  source_url    text,
  unique (city_id, date)
);

-- PPAC price build-up snapshots:
-- retail = base_price + freight + dealer_commission + central_excise + state_vat
create table price_buildup (
  id                bigint generated always as identity primary key,
  city_id           bigint not null references cities (id) on delete cascade,
  date              date not null,
  base_price        numeric(8, 2) not null,
  freight           numeric(8, 2) not null,
  dealer_commission numeric(8, 2) not null,
  central_excise    numeric(8, 2) not null,
  state_vat         numeric(8, 2) not null,
  unique (city_id, date)
);

-- MoPNG announced ethanol procurement prices by feedstock
create table ethanol_prices (
  id              bigint generated always as identity primary key,
  supply_year     text not null,
  feedstock       text not null,
  price_per_litre numeric(8, 2) not null,
  source_url      text,
  unique (supply_year, feedstock)
);

-- History of the blend mandate (E10 -> E20) and its energy factor vs E0
create table blend_config (
  id             bigint generated always as identity primary key,
  effective_from date not null unique,
  blend_pct      numeric(5, 2) not null check (blend_pct >= 0 and blend_pct <= 100),
  energy_factor  numeric(6, 4) not null check (energy_factor > 0 and energy_factor <= 1)
);

-- Optional context series
create table crude_prices (
  id                bigint generated always as identity primary key,
  date              date not null unique,
  indian_basket_usd numeric(8, 2) not null,
  usd_inr           numeric(8, 2) not null
);

-- Named model assumptions surfaced in the Methodology section
create table assumptions (
  id         bigint generated always as identity primary key,
  key        text not null unique,
  value      numeric not null,
  note       text,
  source_url text,
  as_of      date
);

alter table cities         enable row level security;
alter table fuel_prices    enable row level security;
alter table price_buildup  enable row level security;
alter table ethanol_prices enable row level security;
alter table blend_config   enable row level security;
alter table crude_prices   enable row level security;
alter table assumptions    enable row level security;

create policy "public read" on cities         for select to anon using (true);
create policy "public read" on fuel_prices    for select to anon using (true);
create policy "public read" on price_buildup  for select to anon using (true);
create policy "public read" on ethanol_prices for select to anon using (true);
create policy "public read" on blend_config   for select to anon using (true);
create policy "public read" on crude_prices   for select to anon using (true);
create policy "public read" on assumptions    for select to anon using (true);
