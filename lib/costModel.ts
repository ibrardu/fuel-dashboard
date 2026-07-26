// Pure cost-model functions. No I/O, no framework imports — unit-testable
// and driven entirely by DB rows.
//
// Retail petrol price build-up (PPAC methodology):
//   retail = base_price + freight + dealer_commission + central_excise + state_vat
//
// The stored base_price is the petrol-equivalent base OMCs charge. The real
// blended input cost with p% ethanol is:
//   blended_base = (1 - p) * base_price + p * ethanol_price
//   blending_saving = base_price - blended_base   (negative when ethanol is dearer)
// A pass-through "fair" retail charges blended_base through the same tax
// stack; VAT is ad-valorem, so it is recomputed on the reduced pre-VAT sum.

export interface BuildupComponents {
  base_price: number;
  freight: number;
  dealer_commission: number;
  central_excise: number;
}

export interface CostInputs {
  buildup: BuildupComponents;
  /** Ad-valorem VAT rate applied to the pre-VAT sum, e.g. 0.194. */
  vat_rate: number;
  /** Pump price as quoted (from fuel_prices); the anchor for the gap. */
  quoted_retail: number;
  /** OMC landed ethanol price, ₹/L. */
  ethanol_price: number;
  /** Blend share as a fraction, e.g. 0.20 for E20. */
  blend_fraction: number;
  /** Energy content of the blend relative to E0, e.g. 0.964. */
  energy_factor: number;
}

export interface CostBreakdown {
  /** base + freight + commission + excise */
  pre_tax: number;
  vat: number;
  /** pre_tax + vat; should track quoted_retail closely */
  computed_retail: number;
  blended_base: number;
  /** base_price − blended_base; positive when ethanol < petrol base */
  blending_saving: number;
  fair_pre_tax: number;
  fair_vat: number;
  fair_retail: number;
  /** quoted_retail − fair_retail: +ve = consumers overpay, −ve = blend premium */
  gap: number;
  /** quoted_retail / energy_factor — price per E0-equivalent litre */
  effective_retail: number;
  effective_fair: number;
  /** effective_retail − quoted_retail: what the energy shortfall costs per litre */
  energy_penalty: number;
}

export function retailFromBuildup(b: BuildupComponents, vatRate: number): number {
  const preTax = b.base_price + b.freight + b.dealer_commission + b.central_excise;
  return preTax * (1 + vatRate);
}

export function blendedBase(basePrice: number, ethanolPrice: number, blendFraction: number): number {
  return (1 - blendFraction) * basePrice + blendFraction * ethanolPrice;
}

export function blendingSaving(basePrice: number, ethanolPrice: number, blendFraction: number): number {
  return blendFraction * (basePrice - ethanolPrice);
}

export function effectivePrice(price: number, energyFactor: number): number {
  return price / energyFactor;
}

export function computeCost(inputs: CostInputs): CostBreakdown {
  const { buildup: b, vat_rate, quoted_retail, ethanol_price, blend_fraction, energy_factor } = inputs;

  const pre_tax = b.base_price + b.freight + b.dealer_commission + b.central_excise;
  const vat = pre_tax * vat_rate;
  const computed_retail = pre_tax + vat;

  const blended = blendedBase(b.base_price, ethanol_price, blend_fraction);
  const saving = blendingSaving(b.base_price, ethanol_price, blend_fraction);

  const fair_pre_tax = pre_tax - saving;
  const fair_vat = fair_pre_tax * vat_rate;
  const fair_retail = fair_pre_tax + fair_vat;

  return {
    pre_tax,
    vat,
    computed_retail,
    blended_base: blended,
    blending_saving: saving,
    fair_pre_tax,
    fair_vat,
    fair_retail,
    gap: quoted_retail - fair_retail,
    effective_retail: effectivePrice(quoted_retail, energy_factor),
    effective_fair: effectivePrice(fair_retail, energy_factor),
    energy_penalty: effectivePrice(quoted_retail, energy_factor) - quoted_retail,
  };
}

export interface AnnualImpactInputs {
  /** ₹/L difference the rider absorbs. */
  per_litre: number;
  km_per_year: number;
  /** Vehicle mileage on E0 petrol, km/L. */
  kmpl_e0: number;
  energy_factor: number;
}

/** Yearly ₹ impact for a vehicle: litres burned on the blend × per-litre amount. */
export function annualImpact({ per_litre, km_per_year, kmpl_e0, energy_factor }: AnnualImpactInputs): number {
  const litresPerYear = km_per_year / (kmpl_e0 * energy_factor);
  return per_litre * litresPerYear;
}
