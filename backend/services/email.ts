/**
 * Servicio de Email para notificaciones automáticas
 * Usa Nodemailer para enviar emails
 */

import nodemailer from "nodemailer";

// Configurar transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Enviar email genérico
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@heladeria-nevado.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log("📧 Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

/**
 * Enviar confirmación de pedido
 */
export async function sendOrderConfirmation(input: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  orderTotal: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  deliveryAddress: string;
}) {
  const itemsHtml = input.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">¡Pedido Confirmado!</h1>
        <p style="margin: 5px 0 0 0;">Heladería Nevado</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <p>Hola <strong>${input.customerName}</strong>,</p>
        
        <p>Gracias por tu compra. Tu pedido ha sido confirmado y será preparado pronto.</p>
        
        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Número de Pedido:</strong> #${input.orderNumber}</p>
          <p><strong>Dirección de Entrega:</strong> ${input.deliveryAddress}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #667eea;">Producto</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #667eea;">Cantidad</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #667eea;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f0f0f0; font-weight: bold;">
              <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
              <td style="padding: 10px; text-align: right;">$${(input.orderTotal / 100).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p>Puedes rastrear tu pedido en tu perfil: <a href="https://heladeria-nevado.com/profile" style="color: #667eea;">Ver mis pedidos</a></p>
        
        <p>Si tienes preguntas, contáctanos a través de nuestro formulario de contacto.</p>
        
        <p>¡Gracias por elegir Heladería Nevado! 🍦</p>
      </div>
      
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
        <p>© 2024 Heladería Nevado. Todos los derechos reservados.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: input.customerEmail,
    subject: `Confirmación de Pedido #${input.orderNumber}`,
    html,
  });
}

/**
 * Enviar actualización de estado de pedido
 */
export async function sendOrderStatusUpdate(input: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  status: string;
  statusMessage: string;
}) {
  const statusEmoji: Record<string, string> = {
    pending: "⏳",
    confirmed: "✅",
    preparing: "👨‍🍳",
    ready: "📦",
    shipped: "🚚",
    delivered: "🎉",
    cancelled: "❌",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Actualización de Pedido</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <p>Hola <strong>${input.customerName}</strong>,</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #667eea;">
          <p style="font-size: 24px; margin: 0;">${statusEmoji[input.status] || "📦"}</p>
          <p style="font-size: 18px; font-weight: bold; margin: 10px 0 0 0;">${input.statusMessage}</p>
          <p style="color: #666; margin: 5px 0 0 0;">Pedido #${input.orderNumber}</p>
        </div>
        
        <p>Tu pedido está en camino. Puedes rastrear el estado en tu perfil.</p>
        
        <p><a href="https://heladeria-nevado.com/profile" style="color: #667eea; text-decoration: none; font-weight: bold;">Ver estado del pedido →</a></p>
        
        <p>¡Gracias por tu compra! 🍦</p>
      </div>
      
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
        <p>© 2024 Heladería Nevado. Todos los derechos reservados.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: input.customerEmail,
    subject: `Actualización: Tu pedido #${input.orderNumber} - ${input.statusMessage}`,
    html,
  });
}

/**
 * Enviar respuesta a formulario de contacto
 */
export async function sendContactResponse(input: {
  customerEmail: string;
  customerName: string;
  subject: string;
  message: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Hemos Recibido tu Mensaje</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <p>Hola <strong>${input.customerName}</strong>,</p>
        
        <p>Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto pronto.</p>
        
        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p><strong>Asunto:</strong> ${input.subject}</p>
          <p><strong>Tu mensaje:</strong></p>
          <p style="color: #666; font-style: italic;">${input.message}</p>
        </div>
        
        <p>Nuestro equipo revisará tu solicitud y te responderá en las próximas 24 horas.</p>
        
        <p>¡Gracias por elegir Heladería Nevado! 🍦</p>
      </div>
      
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
        <p>© 2024 Heladería Nevado. Todos los derechos reservados.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: input.customerEmail,
    subject: `Re: ${input.subject}`,
    html,
  });
}

/**
 * Enviar notificación de nuevo contacto al admin
 */
export async function notifyAdminNewContact(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@heladeria-nevado.com";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Nuevo Contacto Recibido</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <p><strong>De:</strong> ${input.name}</p>
        <p><strong>Email:</strong> ${input.email}</p>
        ${input.phone ? `<p><strong>Teléfono:</strong> ${input.phone}</p>` : ""}
        <p><strong>Tipo:</strong> ${input.type}</p>
        <p><strong>Asunto:</strong> ${input.subject}</p>
        
        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p><strong>Mensaje:</strong></p>
          <p>${input.message}</p>
        </div>
        
        <p><a href="https://heladeria-nevado.com/admin" style="color: #667eea; text-decoration: none; font-weight: bold;">Ver en Panel Admin →</a></p>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[${input.type.toUpperCase()}] ${input.subject}`,
    html,
  });
}

/**
 * Verificar disponibilidad del servicio de email
 */
export async function isEmailServiceAvailable(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email service not available:", error);
    return false;
  }
}
