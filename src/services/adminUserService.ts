
import { supabase } from "@/integrations/supabase/client";

/**
 * Remove um usuário do sistema e registra no log de remoção
 * @param userId UUID do usuário a ser removido
 * @param removedBy UUID do admin que remove
 * @param reason Motivo da remoção
 */
export async function removeUserAndLog(userId: string, removedBy: string, reason = "") {
  // Remover usuário do auth (admin privilege required)
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw new Error(authError.message);

  // Registrar no log
  const { error: logError } = await supabase
    .from("user_removal_log")
    .insert([
      {
        user_id: userId,
        removed_by: removedBy,
        reason,
      }
    ]);
  if (logError) throw new Error(logError.message);

  return true;
}
