package com.rewear.backend.payment.gateway;

import com.rewear.backend.config.PaymentGatewayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EsewaGatewayService {

    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
    private static final String SIGNED_FIELD_NAMES = "total_amount,transaction_uuid,product_code";
    private static final String DEFAULT_ZERO = "0";

    private final PaymentGatewayProperties props;
    private final ObjectMapper objectMapper;

    public record EsewaPaymentForm(String actionUrl, Map<String, String> fields) {}

    /**
     * Builds the complete form field configuration for eSewa v2 checkout submission.
     */
    public EsewaPaymentForm buildPaymentForm(
            String referenceId,
            long amountNpr,
            String successUrl,
            String failureUrl
    ) {
        String amountStr = String.valueOf(amountNpr);
        String transactionUuid = sanitize(referenceId);
        String merchantCode = sanitize(props.getEsewa().getMerchantCode());
        String secretKey = sanitize(props.getEsewa().getSecretKey());

        // 1. Build payment form payload fields
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("amount", amountStr);
        fields.put("tax_amount", DEFAULT_ZERO);
        fields.put("total_amount", amountStr); // total_amount = amount + tax + service + delivery
        fields.put("transaction_uuid", transactionUuid);
        fields.put("product_code", merchantCode);
        fields.put("product_service_charge", DEFAULT_ZERO);
        fields.put("product_delivery_charge", DEFAULT_ZERO);
        fields.put("success_url", sanitize(successUrl));
        fields.put("failure_url", sanitize(failureUrl));
        fields.put("signed_field_names", SIGNED_FIELD_NAMES);

        // 2. Generate HMAC message using signed_field_names
        String message = buildSignatureMessage(fields, SIGNED_FIELD_NAMES);
        String signature = generateHmacSha256(message, secretKey);

        fields.put("signature", signature);

        String baseUrl = sanitize(props.getEsewa().getBaseUrl()).replaceAll("/+$", "");
        String actionUrl = baseUrl + "/api/epay/main/v2/form";

        return new EsewaPaymentForm(actionUrl, fields);
    }

    /**
     * Verifies the payment response payload returned by eSewa.
     */
    public boolean verifyPayment(String referenceId, long amountNpr, String encodedResponseData) {
        try {
            if (encodedResponseData == null || encodedResponseData.isBlank()) {
                log.warn("eSewa verification failed: response payload is empty for ref={}", referenceId);
                return false;
            }

            JsonNode json = objectMapper.readTree(decodeBase64(encodedResponseData));

            String status = text(json, "status");
            String transactionUuid = text(json, "transaction_uuid");
            String productCode = text(json, "product_code");
            String signedFieldNames = text(json, "signed_field_names");
            String gatewaySignature = text(json, "signature");

            if (!"COMPLETE".equalsIgnoreCase(status)) {
                log.warn("eSewa transaction not complete: ref={} status={}", referenceId, status);
                return false;
            }
            if (!Objects.equals(referenceId, transactionUuid)) {
                log.warn("eSewa transaction_uuid mismatch: expected={} actual={}", referenceId, transactionUuid);
                return false;
            }
            if (!Objects.equals(sanitize(props.getEsewa().getMerchantCode()), productCode)) {
                log.warn("eSewa product_code mismatch for ref={}", referenceId);
                return false;
            }
            if (!sameAmount(String.valueOf(amountNpr), text(json, "total_amount"))) {
                log.warn("eSewa total_amount mismatch for ref={}: expected={} actual={}",
                        referenceId, amountNpr, text(json, "total_amount"));
                return false;
            }

            String message = buildSignedMessageFromJson(json, signedFieldNames);
            String secretKey = sanitize(props.getEsewa().getSecretKey());
            String expectedSignature = generateHmacSha256(message, secretKey);

            boolean verified = expectedSignature.equals(gatewaySignature);
            if (!verified) {
                log.warn("eSewa signature verification failed for ref={}", referenceId);
            }
            return verified;
        } catch (Exception e) {
            log.error("Error occurred while verifying eSewa payment for ref={}", referenceId, e);
            return false;
        }
    }

    private String generateHmacSha256(String message, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256_ALGORITHM
            );
            mac.init(keySpec);
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate HMAC SHA256 signature", e);
        }
    }

    private String buildSignatureMessage(Map<String, String> fields, String signedFieldNames) {
        String[] keys = signedFieldNames.split(",");
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < keys.length; i++) {
            String key = keys[i].trim();
            if (i > 0) {
                builder.append(",");
            }
            builder.append(key).append("=").append(fields.getOrDefault(key, ""));
        }
        return builder.toString();
    }

    private String buildSignedMessageFromJson(JsonNode json, String signedFieldNames) {
        String[] keys = signedFieldNames.split(",");
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < keys.length; i++) {
            String key = keys[i].trim();
            if (i > 0) {
                builder.append(",");
            }
            builder.append(key).append("=").append(text(json, key));
        }
        return builder.toString();
    }

    private byte[] decodeBase64(String value) {
        try {
            return Base64.getDecoder().decode(value);
        } catch (IllegalArgumentException e) {
            return Base64.getUrlDecoder().decode(value);
        }
    }

    private String text(JsonNode json, String field) {
        JsonNode node = json.get(field);
        return (node == null || node.isNull()) ? "" : node.asText();
    }

    private boolean sameAmount(String expected, String actual) {
        if (actual == null || actual.isBlank()) return false;
        try {
            BigDecimal exp = new BigDecimal(expected.replace(",", "").trim());
            BigDecimal act = new BigDecimal(actual.replace(",", "").trim());
            return exp.compareTo(act) == 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String sanitize(String input) {
        return input == null ? "" : input.trim().replaceAll("[\\r\\n]", "");
    }
}