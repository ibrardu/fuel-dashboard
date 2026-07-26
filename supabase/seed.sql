-- Seed data mirroring lib/seedData.ts. vat_rate is calibrated so
-- base + freight + commission + excise, grossed up by VAT, reproduces the
-- quoted metro RSPs.

insert into cities (name, state, vat_rate) values
  ('Delhi',     'Delhi',         0.1940),
  ('Mumbai',    'Maharashtra',   0.3030),
  ('Kolkata',   'West Bengal',   0.3205),
  ('Chennai',   'Tamil Nadu',    0.2678),
  ('Bengaluru', 'Karnataka',     0.2954),
  ('Hyderabad', 'Telangana',     0.3512);

-- ~90 days of daily retail quotes per city (pump prices flat — that is the
-- story the trend chart tells)
insert into fuel_prices (city_id, date, petrol_retail, diesel_retail, source_url)
select c.id, d::date, v.retail, null, 'https://ppac.gov.in/'
from (values
  ('Delhi',      94.77),
  ('Mumbai',    103.50),
  ('Kolkata',   104.95),
  ('Chennai',   100.80),
  ('Bengaluru', 102.92),
  ('Hyderabad', 107.46)
) as v (city, retail)
join cities c on c.name = v.city
cross join generate_series(date '2026-04-27', date '2026-07-25', interval '1 day') as d;

-- Weekly Delhi build-up snapshots (base drifts with crude; retail stays flat).
-- state_vat = (base + freight + commission + excise) * vat_rate
insert into price_buildup (city_id, date, base_price, freight, dealer_commission, central_excise, state_vat)
select c.id, w.date::date, w.base, 0.24, 3.77, 19.90,
       round((w.base + 0.24 + 3.77 + 19.90) * 0.1940, 2)
from cities c,
(values
  ('2026-04-27', 56.20),
  ('2026-05-04', 56.05),
  ('2026-05-11', 55.80),
  ('2026-05-18', 55.55),
  ('2026-05-25', 55.30),
  ('2026-06-01', 55.10),
  ('2026-06-08', 54.95),
  ('2026-06-15', 55.05),
  ('2026-06-22', 55.25),
  ('2026-06-29', 55.40),
  ('2026-07-06', 55.52),
  ('2026-07-13', 55.60),
  ('2026-07-20', 55.46)
) as w (date, base)
where c.name = 'Delhi';

-- Latest build-up snapshot for the other metros (same national base + excise,
-- city-specific freight and VAT)
insert into price_buildup (city_id, date, base_price, freight, dealer_commission, central_excise, state_vat)
select c.id, date '2026-07-20', 55.46, v.freight, 3.77, 19.90,
       round((55.46 + v.freight + 3.77 + 19.90) * c.vat_rate, 2)
from (values
  ('Mumbai',    0.30),
  ('Kolkata',   0.35),
  ('Chennai',   0.38),
  ('Bengaluru', 0.32),
  ('Hyderabad', 0.40)
) as v (city, freight)
join cities c on c.name = v.city;

-- MoPNG announced procurement prices by feedstock, ESY 2025-26
insert into ethanol_prices (supply_year, feedstock, price_per_litre, source_url) values
  ('ESY 2025-26', 'C-heavy molasses',        57.97, 'https://mopng.gov.in/en/refining/ethanol-blended-petrol'),
  ('ESY 2025-26', 'B-heavy molasses',        60.73, 'https://mopng.gov.in/en/refining/ethanol-blended-petrol'),
  ('ESY 2025-26', 'Sugarcane juice / syrup', 65.61, 'https://mopng.gov.in/en/refining/ethanol-blended-petrol'),
  ('ESY 2025-26', 'Maize (grain)',           71.86, 'https://mopng.gov.in/en/refining/ethanol-blended-petrol');

-- Blend-mandate history and energy factor of the blend vs E0
insert into blend_config (effective_from, blend_pct, energy_factor) values
  ('2019-04-01', 10, 0.9820),
  ('2023-06-01', 12, 0.9780),
  ('2024-11-01', 15, 0.9730),
  ('2025-04-01', 20, 0.9640);

-- Indian-basket crude context series (deterministic wobble, mirrors seedData.ts)
insert into crude_prices (date, indian_basket_usd, usd_inr)
select d::date,
       round((68.5 + 2.8 * sin((d::date - date '2026-04-27') / 9.0))::numeric, 2),
       round((86.1 + 0.5 * sin((d::date - date '2026-04-27') / 14.0 + 1))::numeric, 2)
from generate_series(date '2026-04-27', date '2026-07-25', interval '1 day') as d;

-- Model assumptions surfaced in the Methodology section
insert into assumptions (key, value, note, source_url, as_of) values
  ('effective_ethanol_price', 65.00,
   'Volume-weighted average OMC landed cost of ethanol incl. GST & transport (estimate across feedstocks)',
   'https://mopng.gov.in/en/refining/ethanol-blended-petrol', '2026-07-01'),
  ('two_wheeler_km_per_year', 10000,
   'Typical annual usage for the annualised-impact figure', null, '2026-07-01'),
  ('two_wheeler_kmpl_e0', 50,
   'Typical 2-wheeler mileage on E0 petrol, km/L', null, '2026-07-01');
