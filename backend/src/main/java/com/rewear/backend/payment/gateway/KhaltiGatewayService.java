package com.rewear.backend.payment.gateway;

import com.rewear.backend.config.PaymentGatewayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ClassicHttpResponse;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KhaltiGatewayService {

    private final PaymentGatewayProperties props;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public record KhaltiInitiateResult(String pidx, String paymentUrl){}

    public KhaltiInitiateResult initiatePayment(
            String referenceId,
            long amountPaisa,
            String productName,
            String returnUrl
    )throws Exception{
        // ✅ website_url now comes from config, not hardcoded
        String payload = objectMapper.writeValueAsString(Map.of(
                "return_url",          returnUrl,
                "website_url",         props.getKhalti().getWebsiteUrl(),
                "amount",              amountPaisa,
                "purchase_order_id",   referenceId,
                "purchase_order_name", productName
        ));

        log.info("Khalti initiate request: ref={} amountPaisa={}", referenceId, amountPaisa);

        String body = post(
                props.getKhalti().getBaseUrl() + "/api/v2/epayment/initiate/",
                payload
        );

        JsonNode json = objectMapper.readTree(body);

        // ✅ validate required fields exist before accessing
        if (json.get("pidx") == null || json.get("payment_url") == null) {
            log.error("Khalti initiate missing fields in response: {}", body);
            throw new RuntimeException("Khalti initiate response missing pidx or payment_url");
        }

        String pidx       = json.get("pidx").asText();
        String paymentUrl = json.get("payment_url").asText();

        log.info("Khalti initiate success: ref={} pidx={}", referenceId, pidx);
        return new KhaltiInitiateResult(pidx, paymentUrl);
    }

    // ─────────────────────────────────────────────────────────────
    // Step 2: Verify — lookup pidx, check status + amount match
    // ─────────────────────────────────────────────────────────────
    public boolean verifyPayment(String pidx, long expectedAmountPaisa) throws Exception {

        log.info("Khalti verify request: pidx={} expectedPaisa={}", pidx, expectedAmountPaisa);

        String payload = objectMapper.writeValueAsString(Map.of("pidx", pidx));

        String body = post(
                props.getKhalti().getBaseUrl() + "/api/v2/epayment/lookup/",
                payload
        );

        JsonNode json = objectMapper.readTree(body);

        // ✅ null check — Khalti returns error body without "status" on bad pidx
        if (json.get("status") == null) {
            log.error("Khalti lookup bad response for pidx={}: {}", pidx, body);
            return false;
        }

        String status = json.get("status").asText();
        // ✅ safe fallback if total_amount is absent
        long returnedAmount = json.has("total_amount")
                ? json.get("total_amount").asLong()
                : 0L;

        boolean verified = "Completed".equals(status) && returnedAmount == expectedAmountPaisa;

        log.info("Khalti verify result: pidx={} status={} returned={} expected={} verified={}",
                pidx, status, returnedAmount, expectedAmountPaisa, verified);

        return verified;
    }


    // ─────────────────────────────────────────────────────────────
    // Shared HTTP POST helper — avoids duplicating HttpClient setup
    // ─────────────────────────────────────────────────────────────
//    private String post(String url, String jsonPayload) throws Exception {
//        try (CloseableHttpClient client = HttpClients.createDefault()) {
//            HttpPost request = new HttpPost(url);
//            request.setHeader("Authorization", "Key " + props.getKhalti().getSecretKey());
//            request.setHeader("Content-Type", "application/json");
//            request.setEntity(new StringEntity(jsonPayload, ContentType.APPLICATION_JSON));
//
//            ClassicHttpResponse response = (ClassicHttpResponse) client.execute(request);
//            String body = new String(
//                    response.getEntity().getContent().readAllBytes(),
//                    StandardCharsets.UTF_8
//            );
//
//            // ✅ non-200 throws with full body for easy debugging
//            if (response.getCode() != 200) {
//                log.error("Khalti API error [{}] url={} body={}", response.getCode(), url, body);
//                throw new RuntimeException("Khalti API error " + response.getCode() + ": " + body);
//            }
//
//            return body;
//        }
//    }
    private String post(String url, String jsonPayload) throws Exception {

        String secretKey = props.getKhalti().getSecretKey();

        // Temporary diagnostics — never print the actual secret
        log.info("Khalti base URL: {}", props.getKhalti().getBaseUrl());
        log.info("Khalti secret loaded: {}",
                secretKey != null && !secretKey.isBlank());
        log.info("Khalti secret length: {}",
                secretKey == null ? 0 : secretKey.trim().length());

        if (secretKey != null && secretKey.length() >= 8) {
            log.info("Khalti secret preview: {}...{}",
                    secretKey.substring(0, 4),
                    secretKey.substring(secretKey.length() - 4));
        }

        try (CloseableHttpClient client = HttpClients.createDefault()) {

            HttpPost request = new HttpPost(url);

            request.setHeader(
                    "Authorization",
                    "Key " + secretKey.trim()
            );

            request.setHeader(
                    "Content-Type",
                    "application/json"
            );

            request.setEntity(
                    new StringEntity(
                            jsonPayload,
                            ContentType.APPLICATION_JSON
                    )
            );

            log.info("Sending Khalti request to: {}", url);

            ClassicHttpResponse response =
                    (ClassicHttpResponse) client.execute(request);

            String body = new String(
                    response.getEntity()
                            .getContent()
                            .readAllBytes(),
                    StandardCharsets.UTF_8
            );

            log.info(
                    "Khalti response status: {}",
                    response.getCode()
            );

            if (response.getCode() != 200) {
                log.error(
                        "Khalti API error [{}] url={} body={}",
                        response.getCode(),
                        url,
                        body
                );

                throw new RuntimeException(
                        "Khalti API error " +
                                response.getCode() +
                                ": " +
                                body
                );
            }

            return body;
        }
    }
}

