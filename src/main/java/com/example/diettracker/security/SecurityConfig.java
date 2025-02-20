package com.example.diettracker.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
// Spring Security FilterChain
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * 构造注入JwtAuthenticationFilter
     * 也可以用 @Autowired 方式
     */
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * 核心的安全过滤器链配置
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. (可选) 关闭csrf, 前后端分离常用
                .csrf(csrf -> csrf.disable())

                // 2. 配置 CORS 来源 (Spring Security自带的cors)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. 鉴权配置
                .authorizeHttpRequests(auth -> auth
                    // 3.1 放行 OPTIONS 预检请求，以便浏览器跨域预检
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // 3.2 对注册/登录接口放行
                    .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()

                    // 3.3 其它接口需要登录访问
                    .anyRequest().authenticated()
                )

                // 4. 不创建Session (不使用HttpSession存储SecurityContext)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 5. 把自定义的 JWT 过滤器放到 UsernamePasswordAuthenticationFilter 之前
                .addFilterBefore(jwtAuthenticationFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 统一配置 CORS
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 允许的来源(你前端的URL)
        configuration.addAllowedOrigin("http://localhost:5173");
        // 如果可能有其他端口，也可以加多个
        // configuration.addAllowedOriginPattern("http://localhost:[*]");

        // 允许携带cookie
        configuration.setAllowCredentials(true);

        // 允许的方法
        configuration.addAllowedMethod("*");

        // 允许的请求头
        configuration.addAllowedHeader("*");

        // 若需要暴露自定义header给前端，可加
        // configuration.addExposedHeader("Authorization");

        // 注册生效
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 所有路径都应用该配置
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
