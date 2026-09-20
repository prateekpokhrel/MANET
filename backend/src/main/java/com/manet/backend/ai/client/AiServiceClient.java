package com.manet.backend.ai.client;

import com.manet.backend.ai.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Service
public class AiServiceClient {

    private final RestClient restClient;

    public AiServiceClient(RestClient aiRestClient) {
        this.restClient = aiRestClient;
    }

    public Map<?, ?> health() {
        return restClient
                .get()
                .uri("/health")
                .retrieve()
                .body(Map.class);
    }

    public RandomForestResponse predictRandomForest(
            AiNodeFeatures request
    ) {
        return post(
                "/ai/random-forest",
                request,
                RandomForestResponse.class
        );
    }

    public XgboostResponse predictXgboost(
            AiNodeFeatures request
    ) {
        return post(
                "/ai/xgboost",
                request,
                XgboostResponse.class
        );
    }

    public IsolationForestResponse predictIsolationForest(
            IsolationForestFeatures request
    ) {
        return post(
                "/ai/isolation",
                request,
                IsolationForestResponse.class
        );
    }

    public LstmResponse predictLstm(
            LstmRequest request
    ) {
        return post(
                "/ai/lstm",
                request,
                LstmResponse.class
        );
    }

    public RecoveryResponse predictRecovery(
            RecoveryRequest request
    ) {
        return post(
                "/ai/recovery",
                request,
                RecoveryResponse.class
        );
    }

    private <T> T post(
            String path,
            Object body,
            Class<T> responseType
    ) {

        return restClient
                .post()
                .uri(path)
                .body(body)
                .retrieve()
                .body(responseType);
    }

    public boolean isAvailable() {
        try {
            health();
            return true;
        } catch (RestClientException exception) {
            return false;
        }
    }
}
