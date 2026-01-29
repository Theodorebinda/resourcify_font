/**
 * Admin Payments Page
 * 
 * Gestion des paiements avec liste, filtres et remboursements
 */

"use client";

import { useState } from "react";
import { useAdminPayments, useRefundPayment } from "../../../../services/api/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "../../../../components/ui/dialog";
import { useToast } from "../../../../hooks/use-toast";
import { DollarSign, RotateCcw } from "lucide-react";

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");

  const { data: paymentsData, isLoading } = useAdminPayments({}, page, 20);
  const refundPaymentMutation = useRefundPayment();
  const { toast } = useToast();

  const handleRefund = async () => {
    if (!selectedPayment) return;
    
    try {
      await refundPaymentMutation.mutateAsync({
        id: selectedPayment,
        payload: refundAmount
          ? { amount_cents: Math.round(parseFloat(refundAmount) * 100) }
          : undefined,
      });
      toast({
        title: "Paiement remboursé",
        description: refundAmount
          ? `Un remboursement partiel de ${refundAmount}€ a été effectué.`
          : "Un remboursement complet a été effectué.",
      });
      setRefundDialogOpen(false);
      setSelectedPayment(null);
      setRefundAmount("");
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur",
        description: apiError.message || "Impossible de rembourser le paiement",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default";
      case "refunded":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des paiements</h1>
        <p className="text-muted-foreground">
          Gérez les paiements et remboursements
        </p>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des paiements</CardTitle>
          <CardDescription>
            {paymentsData?.count ?? 0} paiement(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : paymentsData && paymentsData.results.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium">Utilisateur</th>
                      <th className="text-left p-4 text-sm font-medium">Montant</th>
                      <th className="text-left p-4 text-sm font-medium">Statut</th>
                      <th className="text-left p-4 text-sm font-medium">Référence</th>
                      <th className="text-left p-4 text-sm font-medium">Date</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsData.results.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{payment.user_email}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">
                            {(payment.amount_cents / 100).toFixed(2)} {payment.currency.toUpperCase()}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground font-mono">
                          {payment.provider_reference.slice(0, 20)}...
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            {payment.status === "completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment.id);
                                  setRefundDialogOpen(true);
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paymentsData.count > 20 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} sur {Math.ceil(paymentsData.count / 20)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!paymentsData.next}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun paiement trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rembourser le paiement</DialogTitle>
            <DialogDescription>
              Entrez un montant pour un remboursement partiel, ou laissez vide pour un remboursement complet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              step="0.01"
              placeholder="Montant (laisser vide pour remboursement complet)"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleRefund}
              disabled={refundPaymentMutation.isPending}
            >
              {refundPaymentMutation.isPending ? "Remboursement..." : "Rembourser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
