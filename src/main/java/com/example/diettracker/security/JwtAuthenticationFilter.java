package com.example.diettracker.security;

import com.example.diettracker.utils.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 自定义JWT校验过滤器：
 *   1. 从请求头中解析JWT
 *   2. 验证JWT有效性
 *   3. 如果验证通过，将用户信息放入SecurityContext
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // 假设token放在"Authorization"头，并以"Bearer "开头
    private static final String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {

        // 1. 获取Authorization头
        String authorizationHeader = request.getHeader("Authorization");

        // 2. 如果没有或不以Bearer开头，直接放行(可能是匿名请求)
        if (authorizationHeader == null || !authorizationHeader.startsWith(TOKEN_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. 提取token
        String token = authorizationHeader.substring(TOKEN_PREFIX.length());

        try {
            // 4. 验证token
            if (JwtUtil.validateToken(token)) {
                // 4.1 获取username
                String username = JwtUtil.parseToken(token);

                // 4.2 构造权限(演示用，这里直接给个ROLE_USER)
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));

                // 4.3 构造Spring Security所需的鉴权对象，并设置到上下文
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (JwtException e) {
            // token不合法，也直接放行或者返回401都行（看需求）
            // 这里演示：直接放行，但实际上可以 response.sendError(401, "Invalid token");
        }

        // 继续后续过滤器
        filterChain.doFilter(request, response);
    }
}

