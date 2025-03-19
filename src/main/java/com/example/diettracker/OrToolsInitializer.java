package com.example.diettracker;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import com.google.ortools.Loader;

@Component // This class is managed by Spring and will be initialized automatically
public class OrToolsInitializer {

    @PostConstruct
    public void init() {
        Loader.loadNativeLibraries();
        System.out.println("OR-Tools JNI library loaded successfully!");
    }
}
