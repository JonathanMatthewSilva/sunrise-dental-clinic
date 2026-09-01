package com.sunrisedental.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SessionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {

        String uri = request.getRequestURI();

        if (uri.equals("/api/auth/login")) {
            return true;
        }

        Object userId = request
                .getSession(false) != null
                ? request.getSession(false).getAttribute("userId")
                : null;

        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"message\":\"Your session has expired. Please sign in again.\"}"
            );
            return false;
        }

        return true;
    }
}
