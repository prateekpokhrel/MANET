package com.manet.backend.ai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class AiClientConfig {

    @Bean
    public RestClient aiRestClient(
            @Value("${manet.ai.base-url:http://localhost:8005}") String baseUrl,
            @Value("${manet.ai.connect-timeout-ms:2000}") int connectTimeoutMs,
            @Value("${manet.ai.read-timeout-ms:5000}") int readTimeoutMs
    ) {

        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(
                Duration.ofMillis(connectTimeoutMs)
        );

        requestFactory.setReadTimeout(
                Duration.ofMillis(readTimeoutMs)
        );

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }
}
