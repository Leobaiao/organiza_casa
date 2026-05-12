"use client";

import { useActionState } from "react";
import { updateProfile, updateHouseholdName } from "@/app/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Home, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function SettingsForm({ profile }: { profile: any }) {
  const [profileState, profileAction, isUpdatingProfile] = useActionState(updateProfile, null);
  const [houseState, houseAction, isUpdatingHouse] = useActionState(updateHouseholdName, null);

  return (
    <div className="grid gap-8">
      {/* Profile Settings */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <User className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Meu Perfil</span>
          </div>
          <CardTitle className="text-white">Informações Pessoais</CardTitle>
          <CardDescription className="text-slate-400">Como os outros membros verão você.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">Nome Completo</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  defaultValue={profile?.full_name} 
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="text-slate-300">WhatsApp (com DDD)</Label>
                <Input 
                  id="whatsappNumber" 
                  name="whatsappNumber" 
                  placeholder="Ex: 11999999999"
                  defaultValue={profile?.whatsapp_number} 
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            </div>

            {profileState?.success && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                {profileState.success}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isUpdatingProfile}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Perfil"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Household Settings (Admin only) */}
      {profile?.role === 'admin' && (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Home className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">A Casa</span>
            </div>
            <CardTitle className="text-white">Gerenciar Lar</CardTitle>
            <CardDescription className="text-slate-400">Configurações exclusivas para administradores.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={houseAction} className="space-y-4">
              <input type="hidden" name="householdId" value={profile?.household_id} />
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Nome da Casa</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={profile?.households?.name} 
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              {houseState?.success && (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {houseState.success}
                </div>
              )}

              {houseState?.error && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {houseState.error}
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isUpdatingHouse}
                  className="bg-slate-800 hover:bg-slate-700 text-white"
                >
                  {isUpdatingHouse ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Atualizar Casa"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">ID: {profile?.id}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 uppercase text-[10px]">
          {profile?.role}
        </Badge>
      </div>
    </div>
  );
}
