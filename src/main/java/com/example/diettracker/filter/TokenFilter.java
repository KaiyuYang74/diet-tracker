// package com.example.diettracker.filter;

// import jakarta.servlet.*;
// import jakarta.servlet.annotation.WebFilter;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import com.example.diettracker.utils.JwtUtil;
// import java.io.IOException;

// @WebFilter(urlPatterns = "/*")
// public class TokenFilter implements Filter {

//     @Override
//     public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
//             throws IOException, ServletException {
//         HttpServletRequest req = (HttpServletRequest) request;
//         HttpServletResponse res = (HttpServletResponse) response;

//         // 如果是预检 OPTIONS 请求，直接放行
//         if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
//             chain.doFilter(request, response);
//             return;
//         }

//         String uri = req.getRequestURI();

//         // 对注册和登录接口放行（注意如果接口路径包含/api/auth/register，要一起判断）
//         if (uri.equals("/register") || uri.equals("/login")
//                 || uri.equals("/api/auth/register") || uri.equals("/api/auth/login")) {
//             chain.doFilter(request, response);
//             return;
//         }

//         String token = req.getHeader("token");
//         if (token == null || token.isEmpty() || !JwtUtil.validateToken(token)) {
//             res.setStatus(401);
//             return;
//         }

//         chain.doFilter(request, response);
//     }
// }