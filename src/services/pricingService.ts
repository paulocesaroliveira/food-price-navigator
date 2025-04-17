
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
      isPerUnit: true
    }));
    
    return {
      id: config.id,
      name: config.name,
      productId: config.product_id,
      baseCost: config.base_cost,
      packagingCost: config.packaging_cost,
      wastagePercentage: config.wastage_percentage,
      desiredMarginPercentage: config.margin_percentage,
      platformFeePercentage: config.platform_fee_percentage,
      taxPercentage: config.tax_percentage,
      totalUnitCost: config.total_unit_cost,
      idealPrice: config.ideal_price,
      finalPrice: config.final_price,
      unitProfit: config.unit_profit,
      actualMargin: config.actual_margin,
      additionalCosts,
      createdAt: config.created_at,
      updatedAt: config.updated_at
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
    isPerUnit: true
  }));
  
  return {
    id: data.id,
    name: data.name,
    productId: data.product_id,
    baseCost: data.base_cost,
    packagingCost: data.packaging_cost,
    wastagePercentage: data.wastage_percentage,
    desiredMarginPercentage: data.margin_percentage,
    platformFeePercentage: data.platform_fee_percentage,
    taxPercentage: data.tax_percentage,
    totalUnitCost: data.total_unit_cost,
    idealPrice: data.ideal_price,
    finalPrice: data.final_price,
    unitProfit: data.unit_profit,
    actualMargin: data.actual_margin,
    additionalCosts,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Create a new pricing configuration
export const createPricingConfig = async (config: Omit<PricingConfiguration, "id" | "createdAt" | "updatedAt">): Promise<PricingConfiguration> => {
  // Calculate the pricing results
  const totalAdditionalCost = config.additionalCosts.reduce((sum, cost) => sum + cost.value, 0);
  const totalUnitCost = config.baseCost + config.packagingCost + totalAdditionalCost;
  const wastageMultiplier = 1 + (config.wastagePercentage / 100);
  const unitCostWithWastage = totalUnitCost * wastageMultiplier;
  
  const marginMultiplier = 1 / (1 - (config.desiredMarginPercentage / 100));
  const idealPrice = unitCostWithWastage * marginMultiplier;
  
  const commissionMultiplier = 1 / (1 - (config.platformFeePercentage / 100));
  const priceWithCommission = idealPrice * commissionMultiplier;
  
  const taxMultiplier = 1 + (config.taxPercentage / 100);
  const finalPrice = priceWithCommission * taxMultiplier;
  
  const unitProfit = idealPrice - unitCostWithWastage;
  const actualMargin = (unitProfit / idealPrice) * 100;
  
  // Insert the pricing config
  const { data, error } = await supabase
    .from("pricing_configs")
    .insert({
      name: config.name,
      product_id: config.productId,
      base_cost: config.baseCost,
      packaging_cost: config.packagingCost,
      wastage_percentage: config.wastagePercentage,
      margin_percentage: config.desiredMarginPercentage,
      platform_fee_percentage: config.platformFeePercentage,
      tax_percentage: config.taxPercentage,
      total_unit_cost: unitCostWithWastage,
      ideal_price: idealPrice,
      final_price: finalPrice,
      unit_profit: unitProfit,
      actual_margin: actualMargin
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating pricing config:", error);
    throw new Error(error.message);
  }
  
  // Insert the additional costs
  if (config.additionalCosts.length > 0) {
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
    productId: data.product_id,
    baseCost: data.base_cost,
    packagingCost: data.packaging_cost,
    wastagePercentage: data.wastage_percentage,
    desiredMarginPercentage: data.margin_percentage,
    platformFeePercentage: data.platform_fee_percentage,
    taxPercentage: data.tax_percentage,
    totalUnitCost: data.total_unit_cost,
    idealPrice: data.ideal_price,
    finalPrice: data.final_price,
    unitProfit: data.unit_profit,
    actualMargin: data.actual_margin,
    additionalCosts: config.additionalCosts,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Update an existing pricing configuration
export const updatePricingConfig = async (id: string, config: Omit<PricingConfiguration, "id" | "createdAt" | "updatedAt">): Promise<PricingConfiguration> => {
  // Calculate the pricing results
  const totalAdditionalCost = config.additionalCosts.reduce((sum, cost) => sum + cost.value, 0);
  const totalUnitCost = config.baseCost + config.packagingCost + totalAdditionalCost;
  const wastageMultiplier = 1 + (config.wastagePercentage / 100);
  const unitCostWithWastage = totalUnitCost * wastageMultiplier;
  
  const marginMultiplier = 1 / (1 - (config.desiredMarginPercentage / 100));
  const idealPrice = unitCostWithWastage * marginMultiplier;
  
  const commissionMultiplier = 1 / (1 - (config.platformFeePercentage / 100));
  const priceWithCommission = idealPrice * commissionMultiplier;
  
  const taxMultiplier = 1 + (config.taxPercentage / 100);
  const finalPrice = priceWithCommission * taxMultiplier;
  
  const unitProfit = idealPrice - unitCostWithWastage;
  const actualMargin = (unitProfit / idealPrice) * 100;
  
  // Update the pricing config
  const { data, error } = await supabase
    .from("pricing_configs")
    .update({
      name: config.name,
      product_id: config.productId,
      base_cost: config.baseCost,
      packaging_cost: config.packagingCost,
      wastage_percentage: config.wastagePercentage,
      margin_percentage: config.desiredMarginPercentage,
      platform_fee_percentage: config.platformFeePercentage,
      tax_percentage: config.taxPercentage,
      total_unit_cost: unitCostWithWastage,
      ideal_price: idealPrice,
      final_price: finalPrice,
      unit_profit: unitProfit,
      actual_margin: actualMargin
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
  if (config.additionalCosts.length > 0) {
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
    productId: data.product_id,
    baseCost: data.base_cost,
    packagingCost: data.packaging_cost,
    wastagePercentage: data.wastage_percentage,
    desiredMarginPercentage: data.margin_percentage,
    platformFeePercentage: data.platform_fee_percentage,
    taxPercentage: data.tax_percentage,
    totalUnitCost: data.total_unit_cost,
    idealPrice: data.ideal_price,
    finalPrice: data.final_price,
    unitProfit: data.unit_profit,
    actualMargin: data.actual_margin,
    additionalCosts: config.additionalCosts,
    createdAt: data.created_at,
    updatedAt: data.updated_at
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
  delete (newConfig as any).createdAt;
  delete (newConfig as any).updatedAt;
  
  // Create the new config
  return createPricingConfig(newConfig);
};
