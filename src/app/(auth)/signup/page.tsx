"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null);

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl text-white">Criar Conta</CardTitle>
        <CardDescription className="text-slate-400">
          Junte-se ao Organiza Casa para gerenciar seu lar.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-300">Nome Completo</Label>
            <Input 
              id="fullName" 
              name="fullName" 
              placeholder="Ex: João Silva" 
              required 
              className="bg-slate-950 border-slate-800 text-white focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">E-mail</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="seu@email.com" 
              required 
              className="bg-slate-950 border-slate-800 text-white focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" name="password" className="text-slate-300">Senha</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="bg-slate-950 border-slate-800 text-white focus:ring-indigo-500"
            />
          </div>
          {state?.error && (
            <p className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all" 
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Conta"}
          </Button>
          <div className="text-center text-sm text-slate-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
