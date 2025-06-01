import { supabase } from "@/integrations/supabase/client";
import { PricingConfiguration, PricingResult, AdditionalCost } from "@/types";
import { 
  calculateTotalProductionCost, 
  calculateSellingPrice, 
  calculatePriceWithCommission, 
  calculatePriceWithTaxes,
  calculateUnitProfit,
  calculateMarkupPercentage
} from "@/utils/calculations";

// Get pricing configurations for a product
export const getPricingConfigs = async (productId?: string): Promise<PricingConfiguration[]> => {
  let query = supabase
    .from("pricing_configs")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (productId) {
    query = query.eq("product_id", productId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching pricing configs:", error);
    throw new Error(error.message);
  }
  
  // Fetch additional costs for each pricing config
  const configs = await Promise.all((data || []).map(async (config) => {
    const { data: expenses, error: expensesError } = await supabase
      .from("pricing_expenses")
      .select("*")
      .eq("pricing_config_id", config.id);
      
    if (expensesError) {
      console.error("Error fetching pricing expenses:", expensesError);
      throw new Error(expensesError.message);
    }
    
    const additionalCosts: AdditionalCost[] = (expenses || []).map(expense => ({
      id: expense.id,
      name: expense.name,
      value: expense.value,
      type: 'fixed', // Default to fixed for existing data
      isPerUnit: true
    }));
    
    return {
      id: config.id,
      name: config.name,
      product_id: config.product_id,
      base_cost: config.base_cost,
      packaging_cost: config.packaging_cost,
      labor_cost: config.labor_cost,
      overhead_cost: config.overhead_cost,
      marketing_cost: config.marketing_cost,
      delivery_cost: config.delivery_cost,
      other_costs: config.other_costs,
      wastage_percentage: config.wastage_percentage,
      margin_percentage: config.margin_percentage,
      target_margin_percentage: config.target_margin_percentage,
      platform_fee_percentage: config.platform_fee_percentage,
      tax_percentage: config.tax_percentage,
      total_unit_cost: config.total_unit_cost,
      ideal_price: config.ideal_price,
      final_price: config.final_price,
      unit_profit: config.unit_profit,
      actual_margin: config.actual_margin,
      minimum_price: config.minimum_price,
      maximum_price: config.maximum_price,
      competitor_price: config.competitor_price,
      notes: config.notes,
      additionalCosts,
      created_at: config.created_at,
      updated_at: config.updated_at
    };
  }));
  
  return configs;
};

// Get a specific pricing configuration
export const getPricingConfig = async (id: string): Promise<PricingConfiguration> => {
  const { data, error } = await supabase
    .from("pricing_configs")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) {
    console.error("Error fetching pricing config:", error);
    throw new Error(error.message);
  }
  
  // Fetch additional costs
  const { data: expenses, error: expensesError } = await supabase
    .from("pricing_expenses")
    .select("*")
    .eq("pricing_config_id", id);
    
  if (expensesError) {
    console.error("Error fetching pricing expenses:", expensesError);
    throw new Error(expensesError.message);
  }
  
  const additionalCosts: AdditionalCost[] = (expenses || []).map(expense => ({
    id: expense.id,
    name: expense.name,
    value: expense.value,
    type: 'fixed', // Default to fixed for existing data
    isPerUnit: true
  }));
  
  return {
    id: data.id,
    name: data.name,
    product_id: data.product_id,
    base_cost: data.base_cost,
    packaging_cost: data.packaging_cost,
    labor_cost: data.labor_cost,
    overhead_cost: data.overhead_cost,
    marketing_cost: data.marketing_cost,
    delivery_cost: data.delivery_cost,
    other_costs: data.other_costs,
    wastage_percentage: data.wastage_percentage,
    margin_percentage: data.margin_percentage,
    target_margin_percentage: data.target_margin_percentage,
    platform_fee_percentage: data.platform_fee_percentage,
    tax_percentage: data.tax_percentage,
    total_unit_cost: data.total_unit_cost,
    ideal_price: data.ideal_price,
    final_price: data.final_price,
    unit_profit: data.unit_profit,
    actual_margin: data.actual_margin,
    minimum_price: data.minimum_price,
    maximum_price: data.maximum_price,
    competitor_price: data.competitor_price,
    notes: data.notes,
    additionalCosts,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Create a new pricing configuration
export const createPricingConfig = async (config: Omit<PricingConfiguration, "id" | "created_at" | "updated_at">): Promise<PricingConfiguration> => {
  // Calculate the pricing results
  const totalAdditionalCost = (config.additionalCosts || []).reduce((sum, cost) => sum + cost.value, 0);
  const totalUnitCost = config.base_cost + config.packaging_cost + totalAdditionalCost;
  const wastageMultiplier = 1 + (config.wastage_percentage / 100);
  const unitCostWithWastage = totalUnitCost * wastageMultiplier;
  
  const marginMultiplier = 1 / (1 - (config.margin_percentage / 100));
  const idealPrice = unitCostWithWastage * marginMultiplier;
  
  const commissionMultiplier = 1 / (1 - (config.platform_fee_percentage / 100));
  const priceWithCommission = idealPrice * commissionMultiplier;
  
  const taxMultiplier = 1 + (config.tax_percentage / 100);
  const finalPrice = priceWithCommission * taxMultiplier;
  
  const unitProfit = idealPrice - unitCostWithWastage;
  const actualMargin = (unitProfit / idealPrice) * 100;
  
  // Insert the pricing config
  const { data, error } = await supabase
    .from("pricing_configs")
    .insert({
      name: config.name,
      product_id: config.product_id,
      base_cost: config.base_cost,
      packaging_cost: config.packaging_cost,
      labor_cost: config.labor_cost || 0,
      overhead_cost: config.overhead_cost || 0,
      marketing_cost: config.marketing_cost || 0,
      delivery_cost: config.delivery_cost || 0,
      other_costs: config.other_costs || 0,
      wastage_percentage: config.wastage_percentage,
      margin_percentage: config.margin_percentage,
      target_margin_percentage: config.target_margin_percentage || config.margin_percentage,
      platform_fee_percentage: config.platform_fee_percentage,
      tax_percentage: config.tax_percentage,
      total_unit_cost: unitCostWithWastage,
      ideal_price: idealPrice,
      final_price: finalPrice,
      unit_profit: unitProfit,
      actual_margin: actualMargin,
      minimum_price: config.minimum_price || 0,
      maximum_price: config.maximum_price || 0,
      competitor_price: config.competitor_price || 0,
      notes: config.notes
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating pricing config:", error);
    throw new Error(error.message);
  }
  
  // Insert the additional costs
  if (config.additionalCosts && config.additionalCosts.length > 0) {
    const expenses = config.additionalCosts.map(cost => ({
      pricing_config_id: data.id,
      name: cost.name,
      value: cost.value
    }));
    
    const { error: expensesError } = await supabase
      .from("pricing_expenses")
      .insert(expenses);
      
    if (expensesError) {
      console.error("Error adding pricing expenses:", expensesError);
      
      // Roll back the pricing config if there was an error
      await supabase.from("pricing_configs").delete().eq("id", data.id);
      
      throw new Error(expensesError.message);
    }
  }
  
  return {
    id: data.id,
    name: data.name,
    product_id: data.product_id,
    base_cost: data.base_cost,
    packaging_cost: data.packaging_cost,
    labor_cost: data.labor_cost,
    overhead_cost: data.overhead_cost,
    marketing_cost: data.marketing_cost,
    delivery_cost: data.delivery_cost,
    other_costs: data.other_costs,
    wastage_percentage: data.wastage_percentage,
    margin_percentage: data.margin_percentage,
    target_margin_percentage: data.target_margin_percentage,
    platform_fee_percentage: data.platform_fee_percentage,
    tax_percentage: data.tax_percentage,
    total_unit_cost: data.total_unit_cost,
    ideal_price: data.ideal_price,
    final_price: data.final_price,
    unit_profit: data.unit_profit,
    actual_margin: data.actual_margin,
    minimum_price: data.minimum_price,
    maximum_price: data.maximum_price,
    competitor_price: data.competitor_price,
    notes: data.notes,
    additionalCosts: config.additionalCosts || [],
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Update an existing pricing configuration
export const updatePricingConfig = async (id: string, config: Omit<PricingConfiguration, "id" | "created_at" | "updated_at">): Promise<PricingConfiguration> => {
  // Calculate the pricing results
  const totalAdditionalCost = (config.additionalCosts || []).reduce((sum, cost) => sum + cost.value, 0);
  const totalUnitCost = config.base_cost + config.packaging_cost + totalAdditionalCost;
  const wastageMultiplier = 1 + (config.wastage_percentage / 100);
  const unitCostWithWastage = totalUnitCost * wastageMultiplier;
  
  const marginMultiplier = 1 / (1 - (config.margin_percentage / 100));
  const idealPrice = unitCostWithWastage * marginMultiplier;
  
  const commissionMultiplier = 1 / (1 - (config.platform_fee_percentage / 100));
  const priceWithCommission = idealPrice * commissionMultiplier;
  
  const taxMultiplier = 1 + (config.tax_percentage / 100);
  const finalPrice = priceWithCommission * taxMultiplier;
  
  const unitProfit = idealPrice - unitCostWithWastage;
  const actualMargin = (unitProfit / idealPrice) * 100;
  
  // Update the pricing config
  const { data, error } = await supabase
    .from("pricing_configs")
    .update({
      name: config.name,
      product_id: config.product_id,
      base_cost: config.base_cost,
      packaging_cost: config.packaging_cost,
      labor_cost: config.labor_cost || 0,
      overhead_cost: config.overhead_cost || 0,
      marketing_cost: config.marketing_cost || 0,
      delivery_cost: config.delivery_cost || 0,
      other_costs: config.other_costs || 0,
      wastage_percentage: config.wastage_percentage,
      margin_percentage: config.margin_percentage,
      target_margin_percentage: config.target_margin_percentage || config.margin_percentage,
      platform_fee_percentage: config.platform_fee_percentage,
      tax_percentage: config.tax_percentage,
      total_unit_cost: unitCostWithWastage,
      ideal_price: idealPrice,
      final_price: finalPrice,
      unit_profit: unitProfit,
      actual_margin: actualMargin,
      minimum_price: config.minimum_price || 0,
      maximum_price: config.maximum_price || 0,
      competitor_price: config.competitor_price || 0,
      notes: config.notes
    })
    .eq("id", id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating pricing config:", error);
    throw new Error(error.message);
  }
  
  // Delete existing additional costs
  const { error: deleteError } = await supabase
    .from("pricing_expenses")
    .delete()
    .eq("pricing_config_id", id);
    
  if (deleteError) {
    console.error("Error deleting pricing expenses:", deleteError);
    throw new Error(deleteError.message);
  }
  
  // Insert the new additional costs
  if (config.additionalCosts && config.additionalCosts.length > 0) {
    const expenses = config.additionalCosts.map(cost => ({
      pricing_config_id: id,
      name: cost.name,
      value: cost.value
    }));
    
    const { error: expensesError } = await supabase
      .from("pricing_expenses")
      .insert(expenses);
      
    if (expensesError) {
      console.error("Error adding pricing expenses:", expensesError);
      throw new Error(expensesError.message);
    }
  }
  
  return {
    id: data.id,
    name: data.name,
    product_id: data.product_id,
    base_cost: data.base_cost,
    packaging_cost: data.packaging_cost,
    labor_cost: data.labor_cost,
    overhead_cost: data.overhead_cost,
    marketing_cost: data.marketing_cost,
    delivery_cost: data.delivery_cost,
    other_costs: data.other_costs,
    wastage_percentage: data.wastage_percentage,
    margin_percentage: data.margin_percentage,
    target_margin_percentage: data.target_margin_percentage,
    platform_fee_percentage: data.platform_fee_percentage,
    tax_percentage: data.tax_percentage,
    total_unit_cost: data.total_unit_cost,
    ideal_price: data.ideal_price,
    final_price: data.final_price,
    unit_profit: data.unit_profit,
    actual_margin: data.actual_margin,
    minimum_price: data.minimum_price,
    maximum_price: data.maximum_price,
    competitor_price: data.competitor_price,
    notes: data.notes,
    additionalCosts: config.additionalCosts || [],
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Delete a pricing configuration
export const deletePricingConfig = async (id: string): Promise<void> => {
  // Delete expenses first (cascade should handle this, but being explicit)
  const { error: expensesError } = await supabase
    .from("pricing_expenses")
    .delete()
    .eq("pricing_config_id", id);
    
  if (expensesError) {
    console.error("Error deleting pricing expenses:", expensesError);
    throw new Error(expensesError.message);
  }
  
  // Delete the pricing config
  const { error } = await supabase
    .from("pricing_configs")
    .delete()
    .eq("id", id);
    
  if (error) {
    console.error("Error deleting pricing config:", error);
    throw new Error(error.message);
  }
};

// Calculate pricing results without saving
export const calculatePricingResults = (
  baseCost: number,
  packagingCost: number,
  wastagePercentage: number,
  additionalCosts: AdditionalCost[],
  desiredMarginPercentage: number,
  platformFeePercentage: number,
  taxPercentage: number
): PricingResult => {
  // Convert additional costs to the format expected by the calculation function
  const costs = additionalCosts.map(cost => ({
    value: cost.value,
    type: cost.type,
    isPerUnit: true
  }));
  
  // Calculate total production cost with wastage and additional costs
  const totalProductionCost = calculateTotalProductionCost(
    baseCost + packagingCost,
    wastagePercentage,
    costs
  );
  
  // Calculate selling price based on desired margin
  const sellingPrice = calculateSellingPrice(totalProductionCost, desiredMarginPercentage);
  
  // Calculate price with platform commission
  const priceWithCommission = calculatePriceWithCommission(sellingPrice, platformFeePercentage);
  
  // Calculate price with taxes
  const priceWithTaxes = calculatePriceWithTaxes(priceWithCommission, taxPercentage);
  
  // Calculate unit profit
  const unitProfit = calculateUnitProfit(sellingPrice, totalProductionCost);
  
  // Calculate applied markup
  const appliedMarkup = calculateMarkupPercentage(sellingPrice, totalProductionCost);
  
  // Calculate minimum recommended price (20% margin as minimum)
  const minimumRecommendedPrice = calculateSellingPrice(totalProductionCost, 20);
  
  return {
    totalProductionCost,
    unitCost: totalProductionCost,
    sellingPrice,
    unitProfit,
    appliedMarkup,
    priceWithCommission,
    priceWithTaxes,
    minimumRecommendedPrice
  };
};

// Duplicate a pricing configuration
export const duplicatePricingConfig = async (id: string, newName: string): Promise<PricingConfiguration> => {
  // Get the original config
  const originalConfig = await getPricingConfig(id);
  
  // Create a new config based on the original
  const newConfig = {
    ...originalConfig,
    name: newName || `${originalConfig.name} (Copy)`
  };
  
  // Remove the properties we don't want to duplicate
  delete (newConfig as any).id;
  delete (newConfig as any).created_at;
  delete (newConfig as any).updated_at;
  
  // Create the new config
  return createPricingConfig(newConfig);
};
