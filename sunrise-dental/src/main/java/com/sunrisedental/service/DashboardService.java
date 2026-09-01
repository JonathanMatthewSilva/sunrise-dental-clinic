package com.sunrisedental.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final JdbcTemplate jdbcTemplate;

    public DashboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getSummary() {

        LocalDate today = LocalDate.now();

        Integer todayAppointments = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM appointments
                WHERE appointment_date = ?
                  AND status <> 'CANCELLED'
                """,
                Integer.class,
                today
        );

        Integer registeredPatients = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM patients
                """,
                Integer.class
        );

        Integer availableDentists = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM dentists
                WHERE active = TRUE
                """,
                Integer.class
        );

        BigDecimal revenueToday = jdbcTemplate.queryForObject(
                """
                SELECT COALESCE(SUM(b.total_amount), 0)
                FROM bills b
                JOIN appointments a
                    ON b.appointment_id = a.appointment_id
                WHERE a.appointment_date = ?
                """,
                BigDecimal.class,
                today
        );

        List<Map<String, Object>> recentAppointments = jdbcTemplate.queryForList(
                """
                SELECT
                    a.appointment_number AS appointmentNumber,
                    p.full_name AS patientName,
                    d.name AS dentistName,
                    t.name AS treatmentType,
                    a.appointment_date AS appointmentDate,
                    a.appointment_time AS appointmentTime,
                    a.status AS status
                FROM appointments a
                JOIN patients p
                    ON a.patient_id = p.patient_id
                JOIN dentists d
                    ON a.dentist_id = d.dentist_id
                JOIN treatments t
                    ON a.treatment_code = t.treatment_code
                ORDER BY a.created_at DESC
                LIMIT 5
                """
        );

        Map<String, Object> response = new HashMap<>();

        response.put("todayAppointments", todayAppointments);
        response.put("registeredPatients", registeredPatients);
        response.put("availableDentists", availableDentists);
        response.put("revenueToday", revenueToday);
        response.put("currency", "LKR");
        response.put("recentAppointments", recentAppointments);

        return response;
    }
}