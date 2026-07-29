import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { validateContactForm } from "@/lib/contact-validation";
import { ContactPayload, ApiResponse } from "@/types/contact";

export async function POST(request: Request) {
  try {
    // 1. Limit content length (~50KB max)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 50000) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Tamanho da requisição excede o limite permitido.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 2. Honeypot Anti-Spam Check
    if (body.companyWebsite && String(body.companyWebsite).trim() !== "") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          code: "SPAM_DETECTED",
          message: "Solicitação rejeitada por filtro de segurança.",
        },
        { status: 400 }
      );
    }

    // 3. Server-side Validation
    const { isValid, errors } = validateContactForm(body);
    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Por favor, revise os campos informados.",
          fieldErrors: errors,
        },
        { status: 400 }
      );
    }

    // 4. Find service details if specific
    const selectedServiceObj = siteConfig.services.find(
      (s) => s.slug === body.serviceSlug
    );
    let serviceName = selectedServiceObj
      ? selectedServiceObj.name
      : "Ainda não sei qual escolher";

    // 4b. Validate Combo from database if provided (Directive #5)
    let validatedComboTitle: string | undefined = undefined;
    if (body.comboSlug && typeof body.comboSlug === "string") {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const { isValidActiveCombo } = await import("@/lib/promotions");
        const supabase = await createClient();
        const nowIso = new Date().toISOString();

        const { data: comboData } = await supabase
          .from("promotional_combos")
          .select("*")
          .eq("slug", body.comboSlug)
          .eq("is_active", true)
          .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
          .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
          .maybeSingle();

        if (comboData && isValidActiveCombo(comboData)) {
          validatedComboTitle = comboData.title;
          serviceName = `${serviceName} (Combo: ${comboData.title})`;
        }
      } catch {
        // Fail quietly on combo validation error
      }
    }

    // 5. Generate Request ID and Timestamp
    const requestId = crypto.randomUUID();
    const submittedAt = new Date().toISOString();

    const payload: ContactPayload = {
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email ? body.email.trim() : undefined,
      serviceSlug: body.serviceSlug,
      preferredPeriod: body.preferredPeriod,
      preferredDate: body.preferredDate || undefined,
      contactPreference: body.contactPreference || "Tanto faz",
      message: body.message ? body.message.trim() : undefined,
      privacyConsent: Boolean(body.privacyConsent),
      requestId,
      submittedAt,
      sourcePath: body.sourcePath || "/contato",
      attribution: body.attribution || {},
    };

    // 6. Dispatch Channels
    const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
    const webhookSecret = process.env.CONTACT_WEBHOOK_SECRET || "";
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;
    const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL;

    let dispatched = false;

    // Channel Option A: Webhook
    if (webhookUrl && webhookUrl.trim() !== "") {
      try {
        const webhookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-contact-secret": webhookSecret,
          },
          body: JSON.stringify(payload),
        });

        if (webhookRes.ok) {
          dispatched = true;
        }
      } catch (err) {
        // Fallthrough to Option B if webhook fails
      }
    }

    // Channel Option B: Resend Email
    if (!dispatched && resendApiKey && fromEmail && recipientEmail) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [recipientEmail],
            subject: `[Agendamento] Solicitação de ${payload.name} (${serviceName})`,
            html: `
              <h2>Nova Solicitação de Agendamento - ${siteConfig.businessName}</h2>
              <p><strong>ID da Solicitação:</strong> ${requestId}</p>
              <p><strong>Nome:</strong> ${payload.name}</p>
              <p><strong>Telefone:</strong> ${payload.phone}</p>
              <p><strong>E-mail:</strong> ${payload.email || "Não informado"}</p>
              <p><strong>Serviço:</strong> ${serviceName}</p>
              <p><strong>Melhor Período:</strong> ${payload.preferredPeriod}</p>
              <p><strong>Data de Preferência:</strong> ${payload.preferredDate || "Não informada"}</p>
              <p><strong>Preferência de Contato:</strong> ${payload.contactPreference}</p>
              <p><strong>Mensagem:</strong> ${payload.message || "Sem mensagem"}</p>
              <hr />
              <p><small>Enviado em: ${submittedAt} | Página: ${payload.sourcePath}</small></p>
            `,
          }),
        });

        if (emailRes.ok) {
          dispatched = true;
        }
      } catch (err) {
        // Handle error
      }
    }

    // Check if channel was unconfigured
    if (!dispatched) {
      if (!webhookUrl && (!resendApiKey || !recipientEmail)) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            code: "CONTACT_CHANNEL_NOT_CONFIGURED",
            message:
              "O formulário está em modo de demonstração pois o canal de recebimento (e-mail/webhook) ainda não foi ativado nas variáveis de ambiente. Por favor, entre em contato diretamente pelo telefone.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          code: "INTERNAL_ERROR",
          message:
            "Não foi possível processar a entrega no momento. Por favor, entre em contato pelo telefone informado no site.",
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json<ApiResponse>({
      success: true,
      code: "SUCCESS",
      message: "Solicitação enviada com sucesso.",
      requestId,
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Ocorreu um erro interno. Por favor, ligue diretamente para o salão.",
      },
      { status: 500 }
    );
  }
}
