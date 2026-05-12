import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/login");
  }

  try {
    const formData = await request.formData();
    let file = formData.get("receipt") as File;

    // Fallback: search for any file if "receipt" is not found
    if (!file || !(file instanceof File)) {
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          file = value;
          break;
        }
      }
    }

    if (!file || !(file instanceof File) || file.size === 0) {
      console.error("No valid file found in share target");
      return redirect("/dashboard?error=Arquivo não encontrado");
    }

    // Upload to a temporary folder in our receipts bucket
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `share-${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `temp/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error during share:", uploadError);
      return redirect("/dashboard");
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    // Redirect to the UI page with the file URL as a parameter
    // The page will handle simulated OCR and final registration
    return redirect(`/dashboard/transactions/share-preview?url=${encodeURIComponent(publicUrl)}`);
  } catch (error) {
    console.error("Share target error:", error);
    return redirect("/dashboard");
  }
}
