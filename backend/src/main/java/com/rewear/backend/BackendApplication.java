package com.rewear.backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.util.Arrays;

@Slf4j
@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(BackendApplication.class);
		Environment env = app.run(args).getEnvironment();
		
		log.info("========================================");
		log.info("ReWear Backend Application Started");
		log.info("========================================");
		log.info("Application Name: {}", env.getProperty("spring.application.name"));
		log.info("Active Profiles: {}", Arrays.toString(env.getActiveProfiles()));
		log.info("Server Port: {}", env.getProperty("server.port"));
		log.info("Database URL: {}", env.getProperty("spring.datasource.url"));
		log.info("Frontend URL: {}", env.getProperty("app.frontend-url"));
		log.info("========================================");
	}
}
