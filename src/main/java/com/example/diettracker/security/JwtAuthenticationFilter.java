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
 * Custom JWT validation filter:
 * 1. Parse JWT from request header
 * 2. Validate JWT
 * 3. If validation passes, put user info into SecurityContext
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Assume token is in "Authorization" header with "Bearer " prefix
    private static final String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Get Authorization header
        String authorizationHeader = request.getHeader("Authorization");

        // 2. If null or doesn't start with Bearer, proceed (could be anonymous request)
        if (authorizationHeader == null || !authorizationHeader.startsWith(TOKEN_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract token
        String token = authorizationHeader.substring(TOKEN_PREFIX.length());

        try {
            // 4. Validate token
            if (JwtUtil.validateToken(token)) {
                // 4.1 Get username
                String username = JwtUtil.parseToken(token);

                // 4.2 Build authorities (for demonstration, just giving ROLE_USER)
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));

                // 4.3 Create Spring Security authentication object and set in context
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username,
                        null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (JwtException e) {
            // Invalid token, continue filter chain or return 401 (depending on
            // requirements)
            // For demo: continue, but could use response.sendError(401, "Invalid token");
        }

        // Continue to next filter
        filterChain.doFilter(request, response);
    }
}