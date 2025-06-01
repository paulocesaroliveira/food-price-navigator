
import { supabase } from "@/integrations/supabase/client";
import type { 
  Reseller, 
  ResaleTransaction, 
  ResaleTransactionItem, 
  CreateResellerRequest, 
  CreateTransactionRequest, 
  CreateTransactionItemRequest 
} from "@/types/resale";

export const resaleService = {
  // Resellers
  async getResellers(): Promise<Reseller[]> {
    const { data, error } = await supabase
      .from('resellers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Ensure status is properly typed
    return (data || []).map(reseller => ({
      ...reseller,
      status: reseller.status as 'active' | 'inactive'
    }));
  },

  async createReseller(reseller: CreateResellerRequest): Promise<Reseller> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('resellers')
      .insert([{
        ...reseller,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      status: data.status as 'active' | 'inactive'
    };
  },

  async updateReseller(id: string, updates: Partial<CreateResellerRequest>): Promise<Reseller> {
    const { data, error } = await supabase
      .from('resellers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      status: data.status as 'active' | 'inactive'
    };
  },

  async deleteReseller(id: string): Promise<void> {
    const { error } = await supabase
      .from('resellers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Transactions
  async getTransactions(): Promise<ResaleTransaction[]> {
    const { data, error } = await supabase
      .from('resale_transactions')
      .select(`
        *,
        reseller:resellers(*),
        resale_transaction_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Ensure status is properly typed for both transaction and reseller
    return (data || []).map(transaction => ({
      ...transaction,
      status: transaction.status as 'pending' | 'delivered' | 'paid' | 'cancelled',
      reseller: transaction.reseller ? {
        ...transaction.reseller,
        status: transaction.reseller.status as 'active' | 'inactive'
      } : undefined
    }));
  },

  async createTransaction(transaction: CreateTransactionRequest): Promise<ResaleTransaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Calculate totals
    const totalAmount = transaction.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0);

    // Get reseller commission and current total sales
    const { data: reseller } = await supabase
      .from('resellers')
      .select('commission_percentage, total_sales')
      .eq('id', transaction.reseller_id)
      .single();

    const commissionAmount = reseller ? 
      (totalAmount * reseller.commission_percentage / 100) : 0;

    // Create transaction
    const { data: newTransaction, error: transactionError } = await supabase
      .from('resale_transactions')
      .insert([{
        user_id: user.id,
        reseller_id: transaction.reseller_id,
        transaction_date: transaction.transaction_date,
        delivery_time: transaction.delivery_time,
        total_amount: totalAmount,
        commission_amount: commissionAmount,
        notes: transaction.notes
      }])
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Create transaction items
    const items = transaction.items.map(item => ({
      transaction_id: newTransaction.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('resale_transaction_items')
      .insert(items);

    if (itemsError) throw itemsError;

    // Update reseller total sales using direct SQL update
    const { error: updateError } = await supabase
      .from('resellers')
      .update({ 
        total_sales: reseller ? reseller.total_sales + totalAmount : totalAmount 
      })
      .eq('id', transaction.reseller_id);

    if (updateError) throw updateError;

    return {
      ...newTransaction,
      status: newTransaction.status as 'pending' | 'delivered' | 'paid' | 'cancelled'
    };
  },

  async updateTransaction(id: string, updates: Partial<CreateTransactionRequest>): Promise<ResaleTransaction> {
    const { data, error } = await supabase
      .from('resale_transactions')
      .update({
        reseller_id: updates.reseller_id,
        transaction_date: updates.transaction_date,
        delivery_time: updates.delivery_time,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      status: data.status as 'pending' | 'delivered' | 'paid' | 'cancelled'
    };
  },

  async updateTransactionStatus(id: string, status: ResaleTransaction['status']): Promise<void> {
    const { error } = await supabase
      .from('resale_transactions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('resale_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
