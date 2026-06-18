package com.rewear.backend.storage;

// storage/SupabaseStorageService.java
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
public class SupabaseStorageService {

    private final WebClient webClient;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api-key}")
    private String supabaseApiKey;

    @Value("${supabase.bucket}")
    private String bucket;

    public SupabaseStorageService(WebClient.Builder webClientBuilder,
                                  @Value("${supabase.url}") String supabaseUrl) {
        this.webClient = webClientBuilder
                .baseUrl(supabaseUrl + "/storage/v1")
                .build();
    }

    /**
     * Uploads a photo file to Supabase Storage and returns the public URL.
     * Stored under {folder}/photos/ inside the single shared bucket.
     *
     * @param file      the multipart file to upload
     * @param folder    sub-folder inside the bucket (e.g. "seller-42")
     * @return          public URL string
     */
    public String uploadPhoto(MultipartFile file, String folder) throws IOException {
        return upload(file, folder + "/photos");
    }

    /**
     * Uploads a video file to Supabase Storage and returns the public URL.
     * Stored under {folder}/videos/ inside the single shared bucket.
     */
    public String uploadVideo(MultipartFile file, String folder) throws IOException {
        return upload(file, folder + "/videos");
    }

    /**
     * Deletes a file from Supabase Storage by its public URL.
     * Extracts bucket and path from URL automatically.
     */
    public void deleteByUrl(String publicUrl) {
        if (!StringUtils.hasText(publicUrl)) return;

        try {
            // URL pattern:  https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
            String marker = "/object/public/";
            int idx = publicUrl.indexOf(marker);
            if (idx == -1) {
                log.warn("Could not parse Supabase URL for deletion: {}", publicUrl);
                return;
            }

            String bucketAndPath = publicUrl.substring(idx + marker.length());
            int slashIdx = bucketAndPath.indexOf('/');
            String bucketName = bucketAndPath.substring(0, slashIdx);
            String path = bucketAndPath.substring(slashIdx + 1);

            deleteFile(bucketName, path);
        } catch (Exception e) {
            log.error("Failed to delete Supabase file: {}", publicUrl, e);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────

    private String upload(MultipartFile file, String folder) throws IOException {
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + (extension != null ? "." + extension : "");
        String objectPath = folder + "/" + fileName;

        byte[] bytes = file.getBytes();
        String contentType = file.getContentType() != null
                ? file.getContentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        // PUT /object/<bucket>/<path>
        webClient.put()
                .uri("/object/{bucket}/{path}", bucket, objectPath)
                .header("Authorization", "Bearer " + supabaseApiKey)
                .header("apikey", supabaseApiKey)
                .contentType(MediaType.parseMediaType(contentType))
                .body(BodyInserters.fromResource(new ByteArrayResource(bytes) {
                    @Override
                    public long contentLength() { return bytes.length; }
                }))
                .retrieve()
                .toBodilessEntity()
                .block();

        // Return the public URL
        String publicUrl = supabaseUrl
                + "/storage/v1/object/public/"
                + bucket + "/"
                + objectPath;

        log.info("Uploaded file to Supabase: {}", publicUrl);
        return publicUrl;
    }

    private void deleteFile(String bucketName, String path) {
        webClient.delete()
                .uri("/object/{bucket}/{path}", bucketName, path)
                .header("Authorization", "Bearer " + supabaseApiKey)
                .header("apikey", supabaseApiKey)
                .retrieve()
                .toBodilessEntity()
                .block();

        log.info("Deleted Supabase file: {}/{}", bucketName, path);
    }
}