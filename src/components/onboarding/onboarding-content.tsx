"use client";

import { useActionState, useState } from "react";
import { createHousehold, joinHousehold } from "@/app/actions/household";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, UserPlus, Loader2 } from "lucide-react";

export function OnboardingContent() {
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [createState, createAction, isCreating] = useActionState(async (_: any, fd: FormData) => createHousehold(fd), null);
  const [joinState, joinAction, isJoining] = useActionState(async (_: any, fd: FormData) => joinHousehold(fd), null);



  if (mode === "choice") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Bem-vindo ao seu novo lar digital</h1>
          <p className="text-slate-400 text-lg">Escolha como você deseja começar a organizar sua casa.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          <button 
            type="button"
            onClick={() => {

              setMode("create");
            }}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-left transition-all hover:border-indigo-500/50 hover:bg-slate-900"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Criar uma nova casa</h3>
            <p className="text-slate-400">Inicie um novo grupo doméstico e convide membros para dividir as contas.</p>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl transition-all group-hover:bg-indigo-500/10" />
          </button>

          <button 
            type="button"
            onClick={() => {

              setMode("join");
            }}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-900"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Entrar em uma casa</h3>
            <p className="text-slate-400">Já tem um grupo? Peça o ID da casa para o administrador e comece a participar.</p>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl transition-all group-hover:bg-cyan-500/10" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setMode("choice")} className="text-slate-400 hover:text-white p-0 h-auto">
              &larr; Voltar
            </Button>
          </div>
          <CardTitle className="text-2xl text-white">
            {mode === "create" ? "Criar Minha Casa" : "Entrar em uma Casa"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {mode === "create" 
              ? "Dê um nome para o seu lar e comece a organizar as finanças." 
              : "Insira o ID único da casa que você deseja participar."}
          </CardDescription>
        </CardHeader>
        <form action={mode === "create" ? createAction : joinAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={mode === "create" ? "name" : "householdId"} className="text-slate-300">
                {mode === "create" ? "Nome da Casa" : "ID da Casa"}
              </Label>
              <Input 
                id={mode === "create" ? "name" : "householdId"} 
                name={mode === "create" ? "name" : "householdId"} 
                placeholder={mode === "create" ? "Ex: Nossa Mansão" : "UUID da casa"} 
                required 
                className="bg-slate-950 border-slate-800 text-white focus:ring-indigo-500"
              />
            </div>
            {(createState?.error || joinState?.error) && (
              <p className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {createState?.error || joinState?.error}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              className={`w-full ${mode === "create" ? "bg-indigo-600 hover:bg-indigo-500" : "bg-cyan-600 hover:bg-cyan-500"} text-white transition-all`} 
              disabled={isCreating || isJoining}
            >
              {isCreating || isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (mode === "create" ? "Criar Agora" : "Entrar na Casa")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
