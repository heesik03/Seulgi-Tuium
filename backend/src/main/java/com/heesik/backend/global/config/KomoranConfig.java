package com.heesik.backend.global.config;

import kr.co.shineware.nlp.komoran.constant.DEFAULT_MODEL;
import kr.co.shineware.nlp.komoran.core.Komoran;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.*;

@Configuration
public class KomoranConfig {

    @Bean
    public Komoran komoran() {
        Komoran komoran = new Komoran(DEFAULT_MODEL.FULL);
        try {
            Resource resource = new ClassPathResource("user.dic");
            if (resource.exists()) {
                File tempFile = File.createTempFile("user_dict", ".dic");
                tempFile.deleteOnExit();
                
                try (InputStream in = resource.getInputStream();
                     OutputStream out = new FileOutputStream(tempFile)) {
                    in.transferTo(out); // 스트림 복사 실행
                }
                
                komoran.setUserDic(tempFile.getAbsolutePath());
            }
        } catch (IOException e) {
        }
        return komoran;
    }
}
