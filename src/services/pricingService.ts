
import { supabase } from '@/lib/supabase';
import { PricingConfiguration, PricingResult, AdditionalCost } from '@/types';
import {
  calculateTotalProductionCost,
  calculateSellingPrice,
  calculatePriceWithCommission,
  calculatePriceWithTaxes,
  calculateUnitProfit,
  calculateMarkupPercentage
} from '@/utils/calculations';

export const calculatePricingResults = (
  baseCost: number,
  packagingCost: number,
  wastagePercentage: number,
  additionalCosts: AdditionalCost[],
  marginPercentage: number,
  platformFeePercentage: number,
  taxPercentage: number
): PricingResult => {
  const unitCost = calculateTotalProductionCost(baseCost, packagingCost, wastagePercentage, additionalCosts);
  const sellingPrice = calculateSellingPrice(unitCost, marginPercentage);
  const priceWithCommission = calculatePriceWithCommission(sellingPrice, platformFeePercentage);
  const priceWithTaxes = calculatePriceWithTaxes(priceWithCommission, taxPercentage);
  const unitProfit = calculateUnitProfit(sellingPrice, unitCost);
  const appliedMarkup = calculateMarkupPercentage(sellingPrice, unitCost);
  const minimumRecommendedPrice = calculateSellingPrice(unitCost, 20); // 20% minimum margin

  return {
    unitCost,
    sellingPrice,
    margin: marginPercentage,
    profit: unitProfit,
    unitProfit,
    appliedMarkup,
    priceWithTaxes,
    priceWithCommission,
    minimumRecommendedPrice
  };
};

export const getPricingConfigurations = async (): Promise<PricingConfiguration[]> => {
  try {
    const { data, error } = await supabase
      .from('pricing_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      user_id: item.user_id || '',
      additionalCosts: []
    }));
  } catch (error) {
    console.error('Error fetching pricing configurations:', error);
    return [];
  }
};

export const createPricingConfiguration = async (config: Omit<PricingConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<PricingConfiguration | null> => {
  try {
    const { additionalCosts, ...configData } = config;
    
    const { data, error } = await supabase
      .from('pricing_configs')
      .insert([configData])
      .select()
      .single();

    if (error) throw error;

    // Handle additional costs if needed
    if (additionalCosts && additionalCosts.length > 0) {
      const costsToInsert = additionalCosts.map(cost => ({
        ...cost,
        pricing_config_id: data.id
      }));

      await supabase
        .from('pricing_expenses')
        .insert(costsToInsert);
    }

    return {
      ...data,
      additionalCosts: additionalCosts || []
    };
  } catch (error) {
    console.error('Error creating pricing configuration:', error);
    return null;
  }
};

export const updatePricingConfiguration = async (id: string, config: Omit<PricingConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<PricingConfiguration | null> => {
  try {
    const { additionalCosts, ...configData } = config;
    
    const { data, error } = await supabase
      .from('pricing_configs')
      .update(configData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Handle additional costs updates if needed
    if (additionalCosts) {
      // Delete existing costs
      await supabase
        .from('pricing_expenses')
        .delete()
        .eq('pricing_config_id', id);

      // Insert new costs
      if (additionalCosts.length > 0) {
        const costsToInsert = additionalCosts.map(cost => ({
          ...cost,
          pricing_config_id: id
        }));

        await supabase
          .from('pricing_expenses')
          .insert(costsToInsert);
      }
    }

    return {
      ...data,
      additionalCosts: additionalCosts || []
    };
  } catch (error) {
    console.error('Error updating pricing configuration:', error);
    return null;
  }
};

export const deletePricingConfiguration = async (id: string): Promise<boolean> => {
  try {
    // Delete associated costs first
    await supabase
      .from('pricing_expenses')
      .delete()
      .eq('pricing_config_id', id);

    // Delete the configuration
    const { error } = await supabase
      .from('pricing_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting pricing configuration:', error);
    return false;
  }
};
