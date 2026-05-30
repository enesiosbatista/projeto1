/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper to retrieve Resend config dynamically, preventing top-level browser bundler issues
function getResendConfig() {
  const apiKey = typeof process !== "undefined" ? process.env?.RESEND_API_KEY || "" : "";
  const isDummy = !apiKey || apiKey.includes("dummy");
  return { apiKey, isDummy };
}

/**
 * Helper to securely send HTTP emails using Resend REST API
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const { apiKey, isDummy } = getResendConfig();

  if (isDummy) {
    console.log(`\n==================================================`);
    console.log(`[Resend Email Mock] Sending Transactional Email:`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content (Truncated): ${html.slice(0, 300)}...`);
    console.log(`==================================================\n`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "ViralMind AI <onboarding@resend.dev>", // Default sandboxed sender on Resend
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Resend Error] API returned status ${res.status}:`, errText);
      return false;
    }

    const data = await res.json();
    console.log(`[Resend SUCCESS] Email sent to ${to}. ID:`, data.id);
    return true;
  } catch (e) {
    console.error("[Resend Exception] Failed to send email:", e);
    return false;
  }
}

/**
 * 1. TRANSACTIONAL EMAIL — Welcome Email (Boas-vindas)
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const subject = "🚀 Bem-vindo à ViralMind AI — Seu canal vai decolar!";
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Bem-vindo à ViralMind AI</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #09090b; color: #e4e4e7; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #0e0e11; border: 1px border #1f1f23; border-radius: 16px; padding: 32px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4); }
        .logo { font-size: 24px; font-weight: 800; color: #7c3aed; text-decoration: none; margin-bottom: 24px; display: inline-block; }
        h1 { color: #ffffff; font-size: 26px; font-weight: 800; margin-top: 0; }
        p { line-height: 1.6; color: #a1a1aa; font-size: 15px; }
        .highlight { color: #a78bfa; font-weight: 600; }
        .button { display: inline-block; background-color: #7c3aed; color: #ffffff !important; text-decoration: none !important; font-weight: 600; padding: 12px 28px; border-radius: 8px; margin-top: 24px; transition: background-color 0.2s; }
        .footer { margin-top: 40px; border-t: 1px solid #1f1f23; padding-top: 20px; font-size: 12px; color: #71717a; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <a href="https://viralmind.ai" class="logo">⚡ ViralMind</a>
        <h1>Olá, ${name}! 👋</h1>
        <p>Seja extremamente bem-vindo à <span class="highlight">ViralMind AI</span>. O produto completo para engenharia reversa de roteiros e otimização viral da internet.</p>
        <p>Preparamos <span class="highlight">5 créditos de boas-vindas</span> na sua conta para você experimentar e começar a faturar imediatamente analisando a concorrência e recriando scripts sem plágio.</p>
        <p>Clique no botão abaixo para acessar o painel e iniciar sua primeira análise:</p>
        <div style="text-align: center;">
          <a href="https://viralmind.ai/dashboard" class="button">Acessar Meu Painel →</a>
        </div>
        <p style="margin-top: 30px; font-size: 13px;">Se precisar de qualquer dica de engajamento ou suporte técnico, basta responder a este e-mail.</p>
        <div class="footer">
          <p>© 2026 ViralMind AI. Todos os direitos reservados.<br>Você recebeu este e-mail porque se cadastrou em nossa plataforma.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject, html });
}

/**
 * 2. TRANSACTIONAL EMAIL — Credits Exhausted Alert (Créditos Zerados)
 */
export async function sendZeroCreditsEmail(email: string, name: string): Promise<boolean> {
  const subject = "⚠️ Seus créditos da ViralMind AI acabaram!";
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Créditos Esgotados</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #09090b; color: #e4e4e7; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #0e0e11; border: 1px solid #1f1f23; border-radius: 16px; padding: 32px; }
        .logo { font-size: 24px; font-weight: 800; color: #7c3aed; text-decoration: none; margin-bottom: 24px; display: inline-block; }
        h1 { color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; }
        p { line-height: 1.6; color: #a1a1aa; font-size: 15px; }
        .highlight { color: #f59e0b; font-weight: 600; }
        .button { display: inline-block; background-color: #7c3aed; color: #ffffff !important; text-decoration: none !important; font-weight: 600; padding: 12px 28px; border-radius: 8px; margin-top: 24px; }
        .footer { margin-top: 40px; border-t: 1px solid #1f1f23; padding-top: 20px; font-size: 12px; color: #71717a; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <a href="https://viralmind.ai" class="logo">⚡ ViralMind</a>
        <h1>Créditos esgotados, ${name}! 📉</h1>
        <p>Notamos que você utilizou o seu último crédito de análise na plataforma e agora sua conta está <span class="highlight">zerada</span>.</p>
        <p>Para não perder o embalo do seu crescimento e continuar otimizando seus títulos, ganchos e roteiros estruturados por nossa inteligência artificial com prioridade na fila, faça o upgrade para o **Plano Premium**.</p>
        <p>Aproveite nossa assinatura **Premium Anual por apenas R$ 89,90/ano** (o equivalente a menos de R$ 7,50 por mês) ou assine o **Mensal por R$ 10,90** e garanta 50 créditos recorrentes mensais.</p>
        <div style="text-align: center;">
          <a href="https://viralmind.ai/pricing" class="button">Fazer Upgrade Agora ⚡</a>
        </div>
        <div class="footer">
          <p>© 2026 ViralMind AI. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject, html });
}

/**
 * 3. TRANSACTIONAL EMAIL — Payment Confirmed (Pagamento Confirmado)
 */
export async function sendPaymentConfirmedEmail(
  email: string,
  name: string,
  planName: string,
): Promise<boolean> {
  const subject = "⚡ Upgrade Confirmado! Acesso Premium liberado na ViralMind AI";
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Upgrade Confirmado!</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #09090b; color: #e4e4e7; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #0e0e11; border: 1px solid #1f1f23; border-radius: 16px; padding: 32px; }
        .logo { font-size: 24px; font-weight: 800; color: #7c3aed; text-decoration: none; margin-bottom: 24px; display: inline-block; }
        h1 { color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; }
        p { line-height: 1.6; color: #a1a1aa; font-size: 15px; }
        .highlight { color: #10b981; font-weight: 600; }
        .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-top: 24px; }
        .button { display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none !important; font-weight: 600; padding: 12px 28px; border-radius: 8px; margin-top: 24px; }
        .footer { margin-top: 40px; border-t: 1px solid #1f1f23; padding-top: 20px; font-size: 12px; color: #71717a; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <a href="https://viralmind.ai" class="logo">⚡ ViralMind</a>
        <h1>Sua assinatura foi confirmada! 🎉</h1>
        <p>Olá, ${name}. Parabéns pelo seu upgrade! Seu pagamento foi processado com absoluto sucesso e seu plano <span class="highlight">Premium</span> está 100% ativo.</p>
        
        <div class="card">
          <h3 style="color: #ffffff; margin-top: 0;">Resumo da Assinatura:</h3>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Plano Adquirido:</strong> ${planName}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Créditos Liberados:</strong> 50 créditos/mês recorrentes</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Status do Faturamento:</strong> <span class="highlight">Ativo / Pago</span></p>
        </div>

        <p>Seus **50 créditos premium** já foram carregados na sua carteira. Agora você tem prioridade máxima na fila de processamento de análises de inteligência artificial de até 60 minutos de duração.</p>
        <div style="text-align: center;">
          <a href="https://viralmind.ai/dashboard" class="button">Começar a Usar Agora →</a>
        </div>
        <p style="margin-top: 30px; font-size: 13px;">Se precisar cancelar ou gerenciar as faturas/cartões de crédito, você pode clicar em <strong>"Gerenciar Assinatura & Cartão"</strong> a qualquer momento diretamente na sua tela de Perfil.</p>
        <div class="footer">
          <p>© 2026 ViralMind AI. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject, html });
}

// TanStack Server Functions to trigger transactional emails securely from the client
import { createServerFn } from "@tanstack/react-start";

export const triggerOnboardingEmail = createServerFn({ method: "POST" })
  .validator((data: { email: string; name: string }) => data)
  .handler(async ({ data }) => {
    console.log(`[Server] Triggering welcome email for ${data.email}`);
    await sendWelcomeEmail(data.email, data.name);
    return { success: true };
  });

export const triggerZeroCreditsEmail = createServerFn({ method: "POST" })
  .validator((data: { email: string; name: string }) => data)
  .handler(async ({ data }) => {
    console.log(`[Server] Triggering out-of-credits email for ${data.email}`);
    await sendZeroCreditsEmail(data.email, data.name);
    return { success: true };
  });
