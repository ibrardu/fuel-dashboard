-- FX history (USD/INR) is available much further back than any confirmed
-- source for the Indian Crude Basket figure, so a full FX backfill must be
-- able to insert a crude_prices row with usd_inr set and indian_basket_usd
-- unknown for that date.
alter table crude_prices alter column indian_basket_usd drop not null;
