package com.heesik.backend.domain.game.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class GameParticipant {
    private Long userId;
    private String name;
    private Boolean isHost;
    private Boolean isReady;
}
