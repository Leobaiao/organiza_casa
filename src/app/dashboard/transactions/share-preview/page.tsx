import { getUser, getProfile } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SharePreviewForm } from "@/components/dashboard/share-preview-form";

export default async function SharePreviewPage({ searchParams }: { searchParams: Promise<{ url: string }> }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.household_id) redirect("/onboarding");

  const { url } = await searchParams;

  if (!url) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold text-white">Novo Pagamento</h1>
        <p className="text-slate-400 text-sm">Validando comprovante compartilhado...</p>
      </div>

      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
        <div className="aspect-[3/4] relative bg-slate-950 overflow-hidden">
          {url.toLowerCase().endsWith('.pdf') ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="h-20 w-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-300 font-medium">Documento PDF</p>
              <p className="text-xs text-slate-500 mt-1 truncate max-w-full px-4">{url.split('/').pop()}</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 text-xs text-indigo-400 hover:underline"
              >
                Visualizar PDF completo
              </a>
            </div>
          ) : (
            <img 
              src={url} 
              alt="Comprovante" 
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>
        
        <SharePreviewForm 
          url={url} 
          householdId={profile.household_id} 
          pixKey={profile.households?.pix_key} 
        />
      </Card>
    </div>
  );
}
