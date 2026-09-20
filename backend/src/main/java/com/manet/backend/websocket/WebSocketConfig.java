package com.manet.backend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig
        implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry
    ) {

        /*
         * React subscribes to /topic/...
         */
        registry.enableSimpleBroker(
                "/topic",
                "/queue"
        );

        /*
         * Client-to-server messages can use /app/...
         */
        registry.setApplicationDestinationPrefixes(
                "/app"
        );
    }

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry
    ) {

        /*
         * WebSocket/STOMP connection endpoint:
         *
         * ws://localhost:8087/ws
         */
        registry.addEndpoint(
                        "/ws"
                )
                .setAllowedOriginPatterns(
                        "*"
                );
    }
}