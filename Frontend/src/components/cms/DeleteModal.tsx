import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
    itemName?: string;
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you absolutely sure?",
    description = "This action cannot be undone. This will permanently delete the item.",
    loading = false,
    itemName
}: DeleteModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={loading ? undefined : onClose}>
            <AlertDialogContent className="z-[10002]">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {itemName ? (
                            <span>
                                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{itemName}</strong>? {description}
                            </span>
                        ) : description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
