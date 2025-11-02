import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Admin <admin@sraut.com.np>',
      to: [email],
      subject: 'Your Account Credentials - Please Change Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #CE9F41; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Our Platform!</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                          Hello <strong>${username}</strong>,
                        </p>
                        
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Your account has been created successfully. Here are your credentials:
                        </p>
                        
                        <!-- Credentials Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-left: 4px solid #CE9F41; border-radius: 4px; margin-bottom: 30px;">
                          <tr>
                            <td style="padding: 20px;">
                              <p style="margin: 0 0 10px 0; color: #555555; font-size: 14px;">
                                <strong style="color: #333333;">Username:</strong> ${username}
                              </p>
                              <p style="margin: 0 0 10px 0; color: #555555; font-size: 14px;">
                                <strong style="color: #333333;">Email:</strong> ${email}
                              </p>
                              <p style="margin: 0; color: #555555; font-size: 14px;">
                                <strong style="color: #333333;">Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${password}</code>
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Warning Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 30px;">
                          <tr>
                            <td style="padding: 15px;">
                              <p style="margin: 0; color: #856404; font-size: 14px; font-weight: bold;">
                                ⚠️ Important Security Notice
                              </p>
                              <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
                                Please change your password immediately after your first login for security reasons.
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Instructions -->
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; font-weight: bold;">
                          To get started:
                        </p>
                        <ol style="color: #555555; font-size: 14px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                          <li>Visit our login page at <a href="https://admin.sraut.com.np/login" style="color: #CE9F41;">admin.sraut.com.np</a></li>
                          <li>Use the credentials provided above</li>
                          <li>Navigate to Settings and change your password</li>
                          <li>Start exploring the platform</li>
                        </ol>
                        
                        <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0;">
                          If you have any questions or need assistance, feel free to contact our support team.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px; margin: 0 0 5px 0;">
                          Best regards,<br/>
                          <strong>The Admin Team</strong>
                        </p>
                        <p style="color: #6c757d; font-size: 11px; margin: 0;">
                          © ${new Date().getFullYear()} sraut.com.np. All rights reserved.
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}