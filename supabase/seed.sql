-- Seed data mirroring lib/seedData.ts. vat_rate is calibrated so
-- base + freight + commission + excise, grossed up by VAT, reproduces the
-- quoted metro RSPs. lat/lng are used for nearest-city geolocation matching.

insert into cities (name, state, vat_rate, lat, lng) values
  ('Delhi',      'Delhi',           0.2407, 28.61390, 77.20900),
  ('Mumbai',     'Maharashtra',     0.3540, 19.07600, 72.87770),
  ('Kolkata',    'West Bengal',     0.3722, 22.57260, 88.36390),
  ('Chennai',    'Tamil Nadu',      0.3174, 13.08270, 80.27070),
  ('Bengaluru',  'Karnataka',       0.3460, 12.97160, 77.59460),
  ('Hyderabad',  'Telangana',       0.4040, 17.38500, 78.48670),
  ('Pune',       'Maharashtra',     0.3325, 18.52040, 73.85670),
  ('Ahmedabad',  'Gujarat',         0.2091, 23.02250, 72.57140),
  ('Jaipur',     'Rajasthan',       0.3634, 26.91240, 75.78730),
  ('Lucknow',    'Uttar Pradesh',   0.2235, 26.84670, 80.94620),
  ('Chandigarh', 'Chandigarh',      0.1638, 30.73330, 76.77940),
  ('Kochi',      'Kerala',          0.3041,  9.93120, 76.26730),
  ('Bhopal',     'Madhya Pradesh',  0.3322, 23.25990, 77.41260),
  ('Patna',      'Bihar',           0.2890, 25.59410, 85.13760);

-- ~90 days of daily retail quotes per city (pump prices flat — that is the
-- story the trend chart tells)
insert into fuel_prices (city_id, date, petrol_retail, diesel_retail, source_url)
select c.id, d::date, v.retail, null, 'https://ppac.gov.in/'
from (values
  ('Delhi',      102.12),
  ('Mumbai',     111.53),
  ('Kolkata',    113.09),
  ('Chennai',    108.62),
  ('Bengaluru',  110.90),
  ('Hyderabad',  115.79),
  ('Pune',       109.80),
  ('Ahmedabad',   99.50),
  ('Jaipur',     112.50),
  ('Lucknow',    101.00),
  ('Chandigarh',  96.00),
  ('Kochi',      107.50),
  ('Bhopal',     110.00),
  ('Patna',      106.50)
) as v (city, retail)
join cities c on c.name = v.city
cross join generate_series(date '2026-04-27', date '2026-07-25', interval '1 day') as d;

-- Weekly Delhi build-up snapshots (base drifts with crude; retail stays flat).
-- Latest week matches the canonical 0.8 x 58.40 + 0.2 x 71.50 = ₹61.02 case.
-- state_vat = (base + freight + commission + excise) * vat_rate
insert into price_buildup (city_id, date, base_price, freight, dealer_commission, central_excise, state_vat)
select c.id, w.date::date, w.base, 0.24, 3.77, 19.90,
       round((w.base + 0.24 + 3.77 + 19.90) * 0.2407, 2)
from cities c,
(values
  ('2026-04-27', 59.18),
  ('2026-05-04', 59.02),
  ('2026-05-11', 58.76),
  ('2026-05-18', 58.49),
  ('2026-05-25', 58.23),
  ('2026-06-01', 58.02),
  ('2026-06-08', 57.86),
  ('2026-06-15', 57.97),
  ('2026-06-22', 58.18),
  ('2026-06-29', 58.34),
  ('2026-07-06', 58.46),
  ('2026-07-13', 58.55),
  ('2026-07-20', 58.40)
) as w (date, base)
where c.name = 'Delhi';

-- Latest build-up snapshot for the other metros (same national base + excise,
-- city-specific freight and VAT)
insert into price_buildup (city_id, date, base_price, freight, dealer_commission, central_excise, state_vat)
select c.id, date '2026-07-20', 58.40, v.freight, 3.77, 19.90,
       round((58.40 + v.freight + 3.77 + 19.90) * c.vat_rate, 2)
from (values
  ('Mumbai',     0.30),
  ('Kolkata',    0.35),
  ('Chennai',    0.38),
  ('Bengaluru',  0.32),
  ('Hyderabad',  0.40),
  ('Pune',       0.33),
  ('Ahmedabad',  0.22),
  ('Jaipur',     0.45),
  ('Lucknow',    0.48),
  ('Chandigarh', 0.42),
  ('Kochi',      0.36),
  ('Bhopal',     0.50),
  ('Patna',      0.55)
) as v (city, freight)
join cities c on c.name = v.city;

-- MoPNG announced procurement prices by feedstock, ESY 2025-26
insert into ethanol_prices (supply_year, feedstock, price_per_litre, source_url) values
  ('ESY 2025-26', 'C-heavy molasses',        64.71, 'https://mopng.gov.in/en/refining/ethanol-blended-petrol'),
  ('ESY 2025-26', 'B-heavy molasses',        67.80, 'https://mopng.gov.in/en/refining/ethanol-blended-petrol'),
  ('ESY 2025-26', 'Sugarcane juice / syrup', 73.25, 'https://mopng.gov.in/en/refining/ethanol-blended-petrol'),
  ('ESY 2025-26', 'Maize (grain)',           80.22, 'https://mopng.gov.in/en/refining/ethanol-blended-petrol');

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
  ('effective_ethanol_price', 71.50,
   'Volume-weighted average OMC landed cost of ethanol incl. GST & transport (estimate across feedstocks)',
   'https://mopng.gov.in/en/refining/ethanol-blended-petrol', '2026-07-01'),
  ('two_wheeler_km_per_year', 10000,
   'Typical annual usage for the annualised-impact figure', null, '2026-07-01'),
  ('two_wheeler_kmpl_e0', 50,
   'Typical 2-wheeler mileage on E0 petrol, km/L', null, '2026-07-01');
