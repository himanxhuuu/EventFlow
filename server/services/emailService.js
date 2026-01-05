const nodemailer = require('nodemailer');

// Create transporter - using Gmail as default (can be configured)
const createTransporter = () => {
  // For production, use environment variables
  // For development, you can use Gmail with app password or a service like Ethereal
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Development mode - use console logging (emails won't actually be sent)
  console.log('Email service: Using development mode (emails will be logged to console)');
  return {
    sendMail: async (mailOptions) => {
      console.log('\n=== EMAIL (Development Mode - Not Actually Sent) ===');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      if (mailOptions.text) {
        console.log('Text Content:');
        console.log(mailOptions.text);
      }
      if (mailOptions.html) {
        console.log('HTML Content: (see below)');
        console.log(mailOptions.html.substring(0, 200) + '...');
      }
      console.log('==================================================\n');
      return {
        messageId: 'dev-' + Date.now(),
        previewUrl: null,
        response: 'Email logged (development mode)'
      };
    }
  };
};

const sendEventInvitations = async (guests, event, customSubject, customMessage) => {
  const transporter = createTransporter();
  const results = { sent: [], failed: [] };

  // Create email content
  const eventDate = new Date(event.start_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subject = customSubject || `Invitation: ${event.title}`;
  
  for (const guest of guests) {
    const personalizedMessage = customMessage || 
      `Dear ${guest.name},\n\n` +
      `You are cordially invited to attend:\n\n` +
      `Event: ${event.title}\n` +
      `Type: ${event.event_type}\n` +
      `Date: ${eventDate}\n` +
      (event.description ? `Description: ${event.description}\n\n` : '\n') +
      `We look forward to celebrating with you!\n\n` +
      `Please RSVP at your earliest convenience.\n\n` +
      `Best regards,\nEvent Management Team`;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">You're Invited!</h2>
        <p>Dear ${guest.name},</p>
        <p>You are cordially invited to attend:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${event.title}</h3>
          <p><strong>Type:</strong> ${event.event_type}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
        </div>
        ${customMessage ? `<p>${customMessage.replace(/\n/g, '<br>')}</p>` : ''}
        <p>We look forward to celebrating with you!</p>
        <p>Please RSVP at your earliest convenience.</p>
        <p style="margin-top: 30px;">Best regards,<br>Event Management Team</p>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Event Manager" <${process.env.EMAIL_USER || 'noreply@eventmanager.com'}>`,
        to: guest.email,
        subject: subject,
        text: personalizedMessage,
        html: htmlMessage
      });

      results.sent.push({
        guest: guest.name,
        email: guest.email,
        messageId: info.messageId,
        previewUrl: info.previewUrl || null
      });

      // Log preview URL for Ethereal emails (development)
      if (info.previewUrl) {
        console.log(`Preview URL for ${guest.email}: ${info.previewUrl}`);
      }
    } catch (error) {
      console.error(`Error sending email to ${guest.email}:`, error);
      results.failed.push({
        guest: guest.name,
        email: guest.email,
        error: error.message
      });
    }
  }

  return results;
};

const sendRSVPConfirmation = async (guestData) => {
  const transporter = createTransporter();
  const { name, email, rsvp_status, event } = guestData;

  const statusMessages = {
    confirmed: {
      subject: `RSVP Confirmed: ${event.title}`,
      message: `Thank you for confirming your attendance! We're excited to have you join us.`
    },
    declined: {
      subject: `RSVP Update: ${event.title}`,
      message: `We're sorry you won't be able to join us, but thank you for letting us know.`
    },
    pending: {
      subject: `RSVP Pending: ${event.title}`,
      message: `Your RSVP status is currently pending. Please confirm your attendance.`
    }
  };

  const statusInfo = statusMessages[rsvp_status] || statusMessages.pending;
  const eventDate = new Date(event.start_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const textMessage = `Dear ${name},\n\n${statusInfo.message}\n\nEvent: ${event.title}\nDate: ${eventDate}\n\nYour RSVP Status: ${rsvp_status.toUpperCase()}\n\nBest regards,\nEvent Management Team`;

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">${statusInfo.subject}</h2>
      <p>Dear ${name},</p>
      <p>${statusInfo.message}</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${event.title}</h3>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Your RSVP Status:</strong> <span style="color: ${rsvp_status === 'confirmed' ? '#4CAF50' : rsvp_status === 'declined' ? '#f44336' : '#ff9800'}; font-weight: bold;">${rsvp_status.toUpperCase()}</span></p>
      </div>
      <p>Best regards,<br>Event Management Team</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Event Manager" <${process.env.EMAIL_USER || 'noreply@eventmanager.com'}>`,
      to: email,
      subject: statusInfo.subject,
      text: textMessage,
      html: htmlMessage
    });

    // Log preview URL for Ethereal emails (development)
    if (info.previewUrl) {
      console.log(`RSVP Confirmation Preview URL for ${email}: ${info.previewUrl}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending RSVP confirmation to ${email}:`, error);
    throw error;
  }
};

module.exports = {
  sendEventInvitations,
  sendRSVPConfirmation,
  createTransporter
};

