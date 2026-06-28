import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  ticketTypeId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  buyerName: z.string().min(2).max(80),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(7).max(20).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 422 }
    );
  }
  const input = parsed.data;

  // Attach the order to the signed-in user if there is one (guest checkout ok).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The atomic function enforces inventory + unique codes. Service role is used
  // only to call it; it does not let the client write tables directly.
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("purchase_tickets", {
    p_ticket_type_id: input.ticketTypeId,
    p_quantity: input.quantity,
    p_buyer_name: input.buyerName,
    p_buyer_email: input.buyerEmail,
    p_buyer_phone: input.buyerPhone || null,
    p_user_id: user?.id ?? null,
  });

  if (error) {
    // Surfaces "Only N ticket(s) left" / "no longer on sale" from the function.
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  return NextResponse.json(data);
}