// src/main/java/com/rewear/backend/service/EmailService.java

package com.rewear.backend.user.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Sends the OTP email asynchronously so the HTTP response
     * is not blocked by the mail server round-trip.
     */
    @Async
    public void sendOtpEmail(String toEmail, String fullName, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("RE:WEAR — Your Password Reset OTP");
            helper.setText(buildOtpEmailHtml(fullName, otpCode), true);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send OTP email to: {}. Error: {}", toEmail, e.getMessage());

        }
    }

    /**
     * Sends a confirmation email after password is successfully reset.
     */
    @Async
    public void sendPasswordChangedConfirmationEmail(String toEmail, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("RE:WEAR — Your Password Has Been Changed");
            helper.setText(buildPasswordChangedHtml(fullName), true);

            mailSender.send(message);
            log.info("Password change confirmation email sent to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send confirmation email to: {}. Error: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendModerationEmail(String toEmail,String fullName,String subject,String explanation) {
        try {var message=mailSender.createMimeMessage();var helper=new MimeMessageHelper(message,true,"UTF-8");helper.setFrom(fromEmail);helper.setTo(toEmail);
            helper.setSubject("RE:WEAR — "+subject);helper.setText("Hello "+fullName+",\n\n"+explanation+"\n\nRE:WEAR moderation team",false);mailSender.send(message);
        } catch (MessagingException e){log.error("Failed moderation email to {}: {}",toEmail,e.getMessage());}
    }

    // ── HTML Templates ────────────────────────────────────────────────────────

    private String buildOtpEmailHtml(String fullName, String otpCode) {
        // Split OTP digits for individual box styling
        String[] digits = otpCode.split("");
        StringBuilder digitBoxes = new StringBuilder();
        for (String digit : digits) {
            digitBoxes.append("""
                <span style="display:inline-block; width:46px; height:56px; line-height:56px;
                             text-align:center; font-size:28px; font-weight:700; color:#A33214;
                             background:#FDF6EC; border:2px solid #E8D9C5; border-radius:10px;
                             margin:0 5px; font-family:'Courier New',monospace;">
                    %s
                </span>
            """.formatted(digit));
        }

        return """
            <div style="font-family:Georgia,'Times New Roman',serif; background:#F5EDE2;
                        padding:40px 20px; margin:0;">
              <div style="max-width:520px; margin:auto; background:#FDF6EC;
                          border-radius:18px; overflow:hidden;
                          border:1px solid #EBE0D2;
                          box-shadow:0 6px 28px rgba(163,50,20,0.08);">

                <!-- Header -->
                <div style="background:#A33214; padding:34px; text-align:center;">
                  <h1 style="color:#FDF6EC; margin:0; font-size:26px; letter-spacing:2px;
                             font-weight:700; text-transform:uppercase;">
                    RE:WEAR
                  </h1>
                  <p style="color:#F5DDD2; margin:6px 0 0; font-size:11px;
                            letter-spacing:3px; text-transform:uppercase;">
                    Sustainable &amp; Pre-Loved Fashion
                  </p>
                </div>

                <!-- Body -->
                <div style="padding:40px 36px;">
                  <h2 style="color:#3A2A1E; font-size:21px; margin:0 0 14px; font-weight:700;">
                    Password Reset Request
                  </h2>
                  <p style="color:#6B5D4F; line-height:1.7; margin:0 0 8px; font-size:15px;">
                    Hi Mr. <strong style="color:#3A2A1E;">%s</strong>,
                  </p>
                  <p style="color:#6B5D4F; line-height:1.7; margin:0 0 28px; font-size:15px;">
                    We received a request to reset your password. Use the One-Time Password
                    (OTP) below to continue. This code expires in <strong style="color:#A33214;">10 minutes</strong>.
                  </p>

                  <!-- OTP Boxes -->
                  <div style="text-align:center; margin:32px 0; padding:24px;
                              background:#F5EDE2; border-radius:14px; border:1px dashed #D9C5AE;">
                    %s
                  </div>

                  <p style="color:#9C8E80; font-size:13px; line-height:1.7; margin:28px 0 0;
                             border-top:1px solid #EBE0D2; padding-top:20px;">
                    If you did not request a password reset, you can safely ignore this email —
                    your account remains secure.
                  </p>
                </div>

                <!-- Footer -->
                <div style="background:#F5EDE2; padding:22px; text-align:center;
                            border-top:1px solid #EBE0D2;">
                  <p style="color:#A89A8C; font-size:12px; margin:0; letter-spacing:0.5px;">
                    RE:WEAR &mdash; Fashion That Lasts
                  </p>
                </div>
              </div>
            </div>
        """.formatted(fullName, digitBoxes.toString());
    }

    private String buildPasswordChangedHtml(String fullName) {
        return """
            <div style="font-family:Georgia,'Times New Roman',serif; background:#F5EDE2;
                        padding:40px 20px; margin:0;">
              <div style="max-width:520px; margin:auto; background:#FDF6EC;
                          border-radius:18px; overflow:hidden;
                          border:1px solid #EBE0D2;
                          box-shadow:0 6px 28px rgba(163,50,20,0.08);">

                <!-- Header -->
                <div style="background:#A33214; padding:34px; text-align:center;">
                  <h1 style="color:#FDF6EC; margin:0; font-size:26px; letter-spacing:2px;
                             font-weight:700; text-transform:uppercase;">
                    RE:WEAR
                  </h1>
                  <p style="color:#F5DDD2; margin:6px 0 0; font-size:11px;
                            letter-spacing:3px; text-transform:uppercase;">
                    Sustainable &amp; Pre-Loved Fashion
                  </p>
                </div>

                <!-- Body -->
                <div style="padding:40px 36px;">
                  <div style="text-align:center; margin-bottom:24px;">
                    <span style="display:inline-flex; align-items:center; justify-content:center;
                                 width:56px; height:56px; border-radius:50%%;
                                 background:#EFE3D2; color:#A33214; font-size:28px;
                                 font-weight:700;">
                      &#10003;
                    </span>
                  </div>
                  <h2 style="color:#3A2A1E; font-size:21px; margin:0 0 14px; font-weight:700;
                             text-align:center;">
                    Password Changed Successfully
                  </h2>
                  <p style="color:#6B5D4F; line-height:1.7; margin:0 0 12px; font-size:15px;
                            text-align:center;">
                    Hi Mr. <strong style="color:#3A2A1E;">%s</strong>,
                  </p>
                  <p style="color:#6B5D4F; line-height:1.7; margin:0 0 12px; font-size:15px;
                            text-align:center;">
                    Your password has been changed successfully. You can now log in with
                    your new password.
                  </p>
                  <p style="color:#9C8E80; font-size:13px; line-height:1.7; margin:28px 0 0;
                             border-top:1px solid #EBE0D2; padding-top:20px; text-align:center;">
                    If you did not make this change, please contact our support team
                    immediately. For your security, avoid reusing passwords across platforms.
                  </p>
                </div>

                <!-- Footer -->
                <div style="background:#F5EDE2; padding:22px; text-align:center;
                            border-top:1px solid #EBE0D2;">
                  <p style="color:#A89A8C; font-size:12px; margin:0; letter-spacing:0.5px;">
                    RE:WEAR &mdash; Fashion That Lasts
                  </p>
                </div>
              </div>
            </div>
        """.formatted(fullName);
    }

    /**
     * Sends a transaction receipt email after a payment is successfully
     * verified via eSewa or Khalti.
     */
    @Async
    public void sendPaymentReceiptEmail(String toEmail,
                                        String fullName,
                                        String referenceId,
                                        String gateway,
                                        Long amountNpr,
                                        String gatewayTransactionId,
                                        Long orderId,
                                        String orderStatus,
                                        String completedAt) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("RE:WEAR — Payment Receipt (" + referenceId + ")");
            helper.setText(buildPaymentReceiptHtml(fullName, referenceId, gateway, amountNpr,
                    gatewayTransactionId, orderId, orderStatus, completedAt), true);

            mailSender.send(message);
            log.info("Payment receipt email sent to: {} ref={}", toEmail, referenceId);

        } catch (MessagingException e) {
            log.error("Failed to send payment receipt email to: {}. ref={} Error: {}",
                    toEmail, referenceId, e.getMessage());
        }
    }

    private String buildPaymentReceiptHtml(String fullName,
                                           String referenceId,
                                           String gateway,
                                           Long amountNpr,
                                           String gatewayTransactionId,
                                           Long orderId,
                                           String orderStatus,
                                           String completedAt) {

        String gatewayLabel = "KHALTI".equalsIgnoreCase(gateway) ? "Khalti" : "eSewa";
        String txnIdDisplay = (gatewayTransactionId == null || gatewayTransactionId.isBlank())
                ? "—" : gatewayTransactionId;

        return """
        <div style="font-family:Georgia,'Times New Roman',serif; background:#F5EDE2;
                    padding:40px 20px; margin:0;">
          <div style="max-width:560px; margin:auto; background:#FDF6EC;
                      border-radius:18px; overflow:hidden;
                      border:1px solid #EBE0D2;
                      box-shadow:0 6px 28px rgba(163,50,20,0.08);">

            <!-- Header -->
            <div style="background:#A33214; padding:34px; text-align:center;">
              <h1 style="color:#FDF6EC; margin:0; font-size:26px; letter-spacing:2px;
                         font-weight:700; text-transform:uppercase;">
                RE:WEAR
              </h1>
              <p style="color:#F5DDD2; margin:6px 0 0; font-size:11px;
                        letter-spacing:3px; text-transform:uppercase;">
                Sustainable &amp; Pre-Loved Fashion
              </p>
            </div>

            <!-- Body -->
            <div style="padding:40px 36px;">
              <div style="text-align:center; margin-bottom:20px;">
                <span style="display:inline-flex; align-items:center; justify-content:center;
                             width:56px; height:56px; border-radius:50%%;
                             background:#E9F1E4; color:#3D5C30; font-size:28px;
                             font-weight:700;">
                  &#10003;
                </span>
              </div>

              <h2 style="color:#3A2A1E; font-size:21px; margin:0 0 6px; font-weight:700;
                         text-align:center;">
                Payment Successful
              </h2>
              <p style="color:#6B5D4F; line-height:1.7; margin:0 0 26px; font-size:14px;
                        text-align:center;">
                Hi Mr. <strong style="color:#3A2A1E;">%s</strong>, your payment has been
                received. Here's your receipt.
              </p>

              <!-- Amount highlight -->
              <div style="text-align:center; margin:0 0 28px; padding:20px;
                          background:#F5EDE2; border-radius:14px; border:1px dashed #D9C5AE;">
                <p style="margin:0; font-size:11px; letter-spacing:1.5px; text-transform:uppercase;
                          color:#9C8E80;">Amount Paid</p>
                <p style="margin:6px 0 0; font-size:30px; font-weight:700; color:#A33214;
                          font-family:'Courier New',monospace;">
                  Rs. %,d
                </p>
              </div>

              <!-- Transaction table -->
              <table style="width:100%%; border-collapse:collapse; font-size:13px;
                            border:1px solid #EBE0D2; border-radius:10px; overflow:hidden;">
                <tbody>
                  <tr style="background:#FDF6EC;">
                    <td style="padding:12px 16px; color:#9C8E80; font-weight:600;
                               border-bottom:1px solid #EBE0D2; width:44%%;">Reference ID</td>
                    <td style="padding:12px 16px; color:#3A2A1E; font-weight:700;
                               border-bottom:1px solid #EBE0D2;">%s</td>
                  </tr>
                  <tr style="background:#F9F2E8;">
                    <td style="padding:12px 16px; color:#9C8E80; font-weight:600;
                               border-bottom:1px solid #EBE0D2;">Order ID</td>
                    <td style="padding:12px 16px; color:#3A2A1E; font-weight:700;
                               border-bottom:1px solid #EBE0D2;">#%d</td>
                  </tr>
                  <tr style="background:#FDF6EC;">
                    <td style="padding:12px 16px; color:#9C8E80; font-weight:600;
                               border-bottom:1px solid #EBE0D2;">Payment Method</td>
                    <td style="padding:12px 16px; color:#3A2A1E; font-weight:700;
                               border-bottom:1px solid #EBE0D2;">%s</td>
                  </tr>
                  <tr style="background:#F9F2E8;">
                    <td style="padding:12px 16px; color:#3A2A1E; font-weight:700;
                               border-bottom:1px solid #EBE0D2;">%s</td>
                  </tr>
                  <tr style="background:#FDF6EC;">
                    <td style="padding:12px 16px; color:#9C8E80; font-weight:600;
                               border-bottom:1px solid #EBE0D2;">Order Status</td>
                    <td style="padding:12px 16px; border-bottom:1px solid #EBE0D2;">
                      <span style="display:inline-block; padding:3px 10px; border-radius:20px;
                                   font-size:11px; font-weight:700; letter-spacing:0.5px;
                                   background:#E9F1E4; color:#3D5C30;">%s</span>
                    </td>
                  </tr>
                  <tr style="background:#F9F2E8;">
                    <td style="padding:12px 16px; color:#9C8E80; font-weight:600;">Paid On</td>
                    <td style="padding:12px 16px; color:#3A2A1E; font-weight:700;">%s</td>
                  </tr>
                </tbody>
              </table>

              <p style="color:#9C8E80; font-size:12px; line-height:1.7; margin:26px 0 0;
                         border-top:1px solid #EBE0D2; padding-top:18px;">
                This is an automated receipt for your records. If you did not make this
                payment, please contact our support team immediately.
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#F5EDE2; padding:22px; text-align:center;
                        border-top:1px solid #EBE0D2;">
              <p style="color:#A89A8C; font-size:12px; margin:0; letter-spacing:0.5px;">
                RE:WEAR &mdash; Fashion That Lasts
              </p>
            </div>
          </div>
        </div>
    """.formatted(fullName, amountNpr, referenceId, orderId, gatewayLabel,
                txnIdDisplay, orderStatus, completedAt);
    }
}