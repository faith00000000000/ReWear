package com.rewear.backend.vton;

import com.rewear.backend.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/vton")
@RequiredArgsConstructor
public class VtonController {

    private final SupabaseStorageService supabaseStorageService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.vton-service-url}")
    private String vtonServiceUrl;

    @PostMapping("/image")
    public ResponseEntity<?> tryOn(
            @RequestParam("personImage") MultipartFile personImage,
            @RequestParam("garmentImageUrl") String garmentImageUrl,
            @RequestParam(value = "garmentDescription", defaultValue = "") String garmentDescription
    ) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("person_image", new ByteArrayResource(personImage.getBytes()) {
                @Override
                public String getFilename() {
                    return personImage.getOriginalFilename();
                }
            });
            body.add("garment_image_url", garmentImageUrl);
            body.add("garment_description", garmentDescription);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            log.info("Forwarding try-on to Python service, garment: {}", garmentImageUrl);

            ResponseEntity<byte[]> pyResponse = restTemplate.exchange(
                    vtonServiceUrl + "/api/vton/image",
                    HttpMethod.POST,
                    requestEntity,
                    byte[].class
            );

            byte[] resultBytes = pyResponse.getBody();
            if (resultBytes == null || resultBytes.length == 0) {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "Empty result from try-on service"));
            }

            MultipartFile resultFile = new VtonResultMultipartFile(resultBytes, "result.png");
            String publicUrl = supabaseStorageService.uploadPhoto(resultFile, "vton-results");

            log.info("Try-on uploaded to Supabase: {}", publicUrl);
            return ResponseEntity.ok(Map.of("imageUrl", publicUrl));

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("Python service error: {}", e.getStatusCode());
            return ResponseEntity.status(502).body(Map.of("error", "Try-on generation failed"));
        } catch (Exception e) {
            log.error("Try-on failed", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Try-on failed: " + e.getMessage()));
        }
    }
}