package com.heesik.backend.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * 외부 API(우리말샘 API) 비동기 호출을 위한 전용 스레드 풀
     * 공용 ForkJoinPool 과의 스레드 간섭을 막고 리소스를 격리합니다.
     */
    @Bean(name = "urimalsaemTaskExecutor")
    public Executor urimalsaemTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);       // 기본 활성 스레드 수
        executor.setMaxPoolSize(20);        // 최대 스레드 수
        executor.setQueueCapacity(50);      // 대기 큐 크기
        executor.setThreadNamePrefix("urimal-async-");
        
        // 큐가 가득 차고 최대 스레드 수도 초과했을 때, 호출자 스레드에서 직접 실행하여 백프레셔를 제공합니다.
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
