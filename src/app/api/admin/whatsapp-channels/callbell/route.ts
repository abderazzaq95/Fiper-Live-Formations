import { getDashboardIdentity } from "@/lib/auth";
import { listCallbellResources } from "@/lib/integrations/callbell-admin";

export async function GET() {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "غير مصرح لك بتنفيذ هذا الإجراء." }, { status: 403 });
  try {
    return Response.json(await listCallbellResources());
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "تعذرت مزامنة Callbell." }, { status: 502 });
  }
}
