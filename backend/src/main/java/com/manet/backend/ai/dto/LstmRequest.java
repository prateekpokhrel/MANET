package com.manet.backend.ai.dto;

import java.util.List;

public record LstmRequest(
        Long node_id,
        List<LstmTimeStep> sequence
) {}
