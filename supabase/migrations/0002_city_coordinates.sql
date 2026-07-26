-- Add lat/lng to cities for nearest-city geolocation matching.

alter table cities add column lat numeric(8, 5);
alter table cities add column lng numeric(8, 5);

update cities set
  lat = case name
    when 'Delhi' then 28.6139
    when 'Mumbai' then 19.0760
    when 'Kolkata' then 22.5726
    when 'Chennai' then 13.0827
    when 'Bengaluru' then 12.9716
    when 'Hyderabad' then 17.3850
  end,
  lng = case name
    when 'Delhi' then 77.2090
    when 'Mumbai' then 72.8777
    when 'Kolkata' then 88.3639
    when 'Chennai' then 80.2707
    when 'Bengaluru' then 77.5946
    when 'Hyderabad' then 78.4867
  end
where name in ('Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad');

alter table cities alter column lat set not null;
alter table cities alter column lng set not null;
