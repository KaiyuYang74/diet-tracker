package com.example.diettracker.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.example.diettracker.utils.JwtUtil;

import java.io.IOException;

@WebFilter(urlPatterns = "/*") // filter all requests
public class TokenFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String uri = req.getRequestURI(); // get the request URI

        if (uri.equals("/register") || uri.equals("/login")) {  // if the request is for registration or login
            chain.doFilter(req, res);
            return;
        }

        String token = req.getHeader("token"); // get the token from the request header

        if (token == null || token.isEmpty() || !JwtUtil.validateToken(token)) { // if the token is invalid
            res.setStatus(401);
            return;
        }

        chain.doFilter(req, res);
    }
}