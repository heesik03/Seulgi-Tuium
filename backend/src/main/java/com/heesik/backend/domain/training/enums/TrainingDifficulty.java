package com.heesik.backend.domain.training.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "훈련 난이도")
public enum TrainingDifficulty {
    EASY,
    NORMAL,
    HARD
}
