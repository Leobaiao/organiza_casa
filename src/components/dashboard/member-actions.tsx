"use client";

import { useActionState, useState } from "react";
import { removeMember, toggleAdmin } from "@/app/actions/members";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserMinus, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MemberActionsProps {
  memberId: string;
  memberName: string;
  currentRole: string;
}

export function MemberActions({ memberId, memberName, currentRole }: MemberActionsProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [removeState, removeAction, isRemoving] = useActionState(async (_: any, fd: FormData) => removeMember(fd), null);
  const [toggleState, toggleAction, isToggling] = useActionState(async (_: any, fd: FormData) => toggleAdmin(fd), null);

  const isAdmin = currentRole === 'admin';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300">
          <form action={toggleAction}>
            <input type="hidden" name="memberId" value={memberId} />
            <input type="hidden" name="currentRole" value={currentRole} />
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full flex items-center gap-2 cursor-pointer">
                {isAdmin ? (
                  <>
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <span>Remover Admin</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-indigo-400" />
                    <span>Tornar Admin</span>
                  </>
                )}
                {isToggling && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
              </button>
            </DropdownMenuItem>
          </form>
          
          <DropdownMenuSeparator className="bg-slate-800" />
          
          <DropdownMenuItem 
            className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 gap-2 cursor-pointer"
            onClick={() => setShowDeleteAlert(true)}
          >
            <UserMinus className="h-4 w-4" />
            <span>Remover da Casa</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remover {memberName}?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação irá remover o morador da casa. Ele não terá mais acesso às contas e transações compartilhadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <form action={async (fd) => {
              await removeAction(fd);
              setShowDeleteAlert(false);
            }}>
              <input type="hidden" name="memberId" value={memberId} />
              <AlertDialogAction 
                type="submit"
                className="bg-rose-600 hover:bg-rose-500 text-white border-none"
                disabled={isRemoving}
              >
                {isRemoving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Remover Membro
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
