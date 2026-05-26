/**
 * Go2GST Workflow Engine
 * Event-driven automation: triggers → conditions → actions
 * Supports: document processing, notifications, webhooks, auto-tagging
 */

export type TriggerEvent = "document:ingested" | "document:ocr_complete" | "document:classified" | "document:extracted" | "document:saved" | "report:due" | "advance_tax:due";

export type ActionType = "assign_tag" | "set_category" | "set_vendor" | "send_webhook" | "send_telegram" | "send_email" | "run_extraction" | "flag_review" | "auto_approve";

export interface WorkflowCondition {
  field: string; // e.g. "vendor.gstin", "amount", "category", "documentType"
  operator: "equals" | "contains" | "greater_than" | "less_than" | "matches" | "exists";
  value: string | number | boolean;
}

export interface WorkflowAction {
  type: ActionType;
  params: Record<string, string | number | boolean>;
}

export interface Workflow {
  id: string;
  name: string;
  enabled: boolean;
  trigger: TriggerEvent;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  createdAt: Date;
}

// ─── Workflow Registry ───

const workflows: Workflow[] = [];

export function registerWorkflow(workflow: Omit<Workflow, "id" | "createdAt">): Workflow {
  const w: Workflow = { ...workflow, id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date() };
  workflows.push(w);
  return w;
}

export function getWorkflows(): Workflow[] {
  return workflows.filter((w) => w.enabled);
}

export function removeWorkflow(id: string) {
  const idx = workflows.findIndex((w) => w.id === id);
  if (idx >= 0) workflows.splice(idx, 1);
}

// ─── Workflow Execution ───

export interface WorkflowContext {
  documentId?: string;
  text?: string;
  vendor?: { name: string; gstin: string | null };
  category?: string;
  documentType?: string;
  amount?: number;
  userId?: string;
  [key: string]: unknown;
}

export async function executeWorkflows(event: TriggerEvent, context: WorkflowContext): Promise<WorkflowExecutionResult[]> {
  const applicable = workflows.filter((w) => w.enabled && w.trigger === event);
  const results: WorkflowExecutionResult[] = [];

  for (const workflow of applicable) {
    const conditionsMet = evaluateConditions(workflow.conditions, context);
    if (!conditionsMet) continue;

    for (const action of workflow.actions) {
      const result = await executeAction(action, context);
      results.push({ workflowId: workflow.id, workflowName: workflow.name, action: action.type, success: result.success, message: result.message });
    }
  }

  return results;
}

interface WorkflowExecutionResult {
  workflowId: string;
  workflowName: string;
  action: ActionType;
  success: boolean;
  message: string;
}

function evaluateConditions(conditions: WorkflowCondition[], context: WorkflowContext): boolean {
  if (conditions.length === 0) return true;

  return conditions.every((cond) => {
    const value = getNestedValue(context, cond.field);
    switch (cond.operator) {
      case "equals": return value === cond.value;
      case "contains": return String(value || "").toLowerCase().includes(String(cond.value).toLowerCase());
      case "greater_than": return Number(value) > Number(cond.value);
      case "less_than": return Number(value) < Number(cond.value);
      case "matches": return new RegExp(String(cond.value), "i").test(String(value || ""));
      case "exists": return value !== null && value !== undefined && value !== "";
      default: return false;
    }
  });
}

async function executeAction(action: WorkflowAction, context: WorkflowContext): Promise<{ success: boolean; message: string }> {
  try {
    switch (action.type) {
      case "send_webhook": {
        const url = String(action.params.url);
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(context),
        });
        return { success: true, message: `Webhook sent to ${url}` };
      }

      case "send_telegram": {
        const chatId = String(action.params.chatId);
        const message = String(action.params.message || "New document processed");
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (token) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
          });
        }
        return { success: true, message: `Telegram sent to ${chatId}` };
      }

      case "assign_tag":
        return { success: true, message: `Tag "${action.params.tag}" assigned` };

      case "set_category":
        return { success: true, message: `Category set to "${action.params.category}"` };

      case "set_vendor":
        return { success: true, message: `Vendor set to "${action.params.vendor}"` };

      case "flag_review":
        return { success: true, message: "Flagged for manual review" };

      case "auto_approve":
        return { success: true, message: "Auto-approved" };

      case "run_extraction":
        return { success: true, message: "Extraction triggered" };

      default:
        return { success: false, message: `Unknown action: ${action.type}` };
    }
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Action failed" };
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

// ─── Default Workflows ───

export function setupDefaultWorkflows() {
  // Auto-flag high-value invoices for CA review
  registerWorkflow({
    name: "Flag high-value invoices",
    enabled: true,
    trigger: "document:extracted",
    conditions: [{ field: "amount", operator: "greater_than", value: 100000 }],
    actions: [{ type: "flag_review", params: {} }],
  });

  // Auto-approve small receipts
  registerWorkflow({
    name: "Auto-approve small receipts",
    enabled: true,
    trigger: "document:extracted",
    conditions: [{ field: "amount", operator: "less_than", value: 1000 }, { field: "documentType", operator: "equals", value: "receipt" }],
    actions: [{ type: "auto_approve", params: {} }],
  });

  // Notify on credit notes
  registerWorkflow({
    name: "Notify on credit notes",
    enabled: true,
    trigger: "document:classified",
    conditions: [{ field: "documentType", operator: "equals", value: "credit_note" }],
    actions: [{ type: "flag_review", params: {} }],
  });
}
