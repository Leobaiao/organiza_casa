import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { EvolutionWebhookPayload } from '@/types/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const payload: EvolutionWebhookPayload = await req.json();

    // 1. Check if it's a message with an image
    if (payload.event !== 'MESSAGES_UPSERT' || !payload.data.message.imageMessage) {
      return NextResponse.json({ success: true, message: 'Not an image message' });
    }

    const senderNumber = payload.data.sender.split('@')[0]; // Extract number from "5511999999999@s.whatsapp.net"
    const imageUrl = payload.data.message.imageMessage.url;
    const caption = payload.data.message.imageMessage.caption || '';

    // 2. Identify user in DB
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, household_id')
      .eq('whatsapp_number', senderNumber)
      .single();

    if (profileError || !profile) {
      console.error('User not found:', senderNumber);
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // 3. Create transaction record (Credit)
    // We try to extract amount from caption if it's there (e.g. "R$ 50,00" or "50")
    let amount = 0;
    const amountMatch = caption.match(/[\d,.]+/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[0].replace(',', '.'));
    }

    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: profile.id,
        amount: amount, // Positive for credit
        description: `Comprovante enviado via WhatsApp: ${caption}`,
        proof_url: imageUrl,
        status: 'pending',
        household_id: profile.household_id
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError);
      return NextResponse.json({ success: false, message: 'Error creating transaction' }, { status: 500 });
    }

    // 4. Notify Admin (This would involve another API call to WhatsApp if we had the logic, 
    // but for now we just log it or we could insert a notification record)
    // The user says "Envie uma resposta de aviso ao Admin."
    // I'll look for admins in the same household.
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('whatsapp_number')
      .eq('household_id', profile.household_id)
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      // Logic to send WhatsApp message to admin would go here.
      // Example: notifyAdminViaWhatsApp(admins[0].whatsapp_number, profile.full_name, amount);

    }

    return NextResponse.json({ 
      success: true, 
      message: 'Transaction created and pending validation',
      transaction_id: transaction.id 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
