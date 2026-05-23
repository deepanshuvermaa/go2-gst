/**
 * CA Multi-Client Portal — Invite, manage, bulk review
 * Handles: client invitations, role management, bulk operations
 */

import { db } from "./db";

export async function inviteClient(caUserId: string, phone: string, name?: string) {
  const ca = await db.user.findUnique({ where: { id: caUserId }, include: { organization: true } });
  if (!ca || ca.role !== "CA") throw new Error("Only CAs can invite clients");
  if (!ca.organizationId) throw new Error("CA must have an organization");

  // Create or find user by phone
  const client = await db.user.upsert({
    where: { phone },
    update: { organizationId: ca.organizationId, name: name || undefined },
    create: { phone, name, role: "CLIENT", organizationId: ca.organizationId },
  });

  return client;
}

export async function getCAClients(caUserId: string) {
  const ca = await db.user.findUnique({ where: { id: caUserId } });
  if (!ca?.organizationId) return [];

  const clients = await db.user.findMany({
    where: { organizationId: ca.organizationId, role: "CLIENT" },
    include: {
      transactions: {
        select: { id: true, grandTotal: true, invoiceDate: true, totalIgst: true, totalCgst: true, totalSgst: true },
        orderBy: { invoiceDate: "desc" },
        take: 5,
      },
      _count: { select: { transactions: true } },
    },
  });

  return clients.map((c) => ({
    id: c.id,
    name: c.name || c.phone,
    phone: c.phone,
    billCount: c._count.transactions,
    totalExpenses: c.transactions.reduce((s, t) => s + Number(t.grandTotal || 0), 0),
    lastActivity: c.transactions[0]?.invoiceDate || null,
  }));
}

export async function bulkReviewTransactions(caUserId: string, transactionIds: string[], action: "approve" | "reject" | "flag") {
  const ca = await db.user.findUnique({ where: { id: caUserId } });
  if (!ca || ca.role !== "CA") throw new Error("Unauthorized");

  // In a real app, you'd have a status field on Transaction
  // For now, we'll just verify the CA has access to these transactions
  const transactions = await db.transaction.findMany({
    where: { id: { in: transactionIds }, organizationId: ca.organizationId },
  });

  if (transactions.length !== transactionIds.length) {
    throw new Error("Some transactions not found or unauthorized");
  }

  return { processed: transactions.length, action };
}

export async function getClientSummary(caUserId: string, clientId: string, month: number, year: number) {
  const ca = await db.user.findUnique({ where: { id: caUserId } });
  if (!ca?.organizationId) throw new Error("Unauthorized");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId: clientId,
      organizationId: ca.organizationId,
      invoiceDate: { gte: startDate, lte: endDate },
    },
    include: { lineItems: true },
  });

  const totalExpenses = transactions.reduce((s, t) => s + Number(t.grandTotal || 0), 0);
  const totalGST = transactions.reduce((s, t) => s + Number(t.totalCgst || 0) + Number(t.totalSgst || 0) + Number(t.totalIgst || 0), 0);
  const itcEligible = transactions.filter((t) => t.itcEligible).reduce((s, t) => s + Number(t.totalCgst || 0) + Number(t.totalSgst || 0) + Number(t.totalIgst || 0), 0);

  return { clientId, month, year, billCount: transactions.length, totalExpenses, totalGST, itcEligible, transactions };
}

export async function createOrganization(caUserId: string, name: string, gstin?: string) {
  const org = await db.organization.create({
    data: { name, gstin },
  });

  await db.user.update({
    where: { id: caUserId },
    data: { organizationId: org.id, role: "CA" },
  });

  return org;
}
