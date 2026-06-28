package com.rewear.backend.vton;

import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;

public class VtonResultMultipartFile implements MultipartFile {
    private final byte[] content;
    private final String filename;

    public VtonResultMultipartFile(byte[] content, String filename) {
        this.content = content;
        this.filename = filename;
    }

    @Override public String getName() { return "file"; }
    @Override public String getOriginalFilename() { return filename; }
    @Override public String getContentType() { return "image/png"; }
    @Override public boolean isEmpty() { return content.length == 0; }
    @Override public long getSize() { return content.length; }
    @Override @NonNull public byte[] getBytes() { return content; }
    @Override public InputStream getInputStream() { return new ByteArrayInputStream(content); }
    @Override public void transferTo(@NonNull File dest) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(dest)) {
            fos.write(content);
        }
    }
}