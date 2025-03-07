package com.example.diettracker;

import jakarta.annotation.PostConstruct; 
import org.springframework.stereotype.Component;
import com.google.ortools.Loader;

@Component // 表示这个类由Spring管理，会自动调用初始化
public class OrToolsInitializer {

    @PostConstruct
    public void init() {
        Loader.loadNativeLibraries();
        System.out.println("OR-Tools JNI库成功加载！");
    }
}
