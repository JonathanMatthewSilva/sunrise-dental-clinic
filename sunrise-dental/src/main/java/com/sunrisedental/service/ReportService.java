package com.sunrisedental.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final JdbcTemplate jdbcTemplate;

    public ReportService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getAppointmentReport(
            LocalDate from,
            LocalDate to) {

        List<Map<String, Object>> byDate = jdbcTemplate.queryForList(
                """
                SELECT
                    appointment_date AS date,
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
                    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
                FROM appointments
                WHERE appointment_date BETWEEN ? AND ?
                GROUP BY appointment_date
                ORDER BY appointment_date
                """,
                from,
                to
        );

        List<Map<String, Object>> byDentist = jdbcTemplate.queryForList(
                """
                SELECT
                    d.name AS dentistName,
                    d.specialization AS specialization,
                    COUNT(a.appointment_id) AS appointments,
                    SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
                    SUM(CASE WHEN a.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
                FROM dentists d
                LEFT JOIN appointments a
                    ON d.dentist_id = a.dentist_id
                    AND a.appointment_date BETWEEN ? AND ?
                GROUP BY d.dentist_id, d.name, d.specialization
                ORDER BY d.name
                """,
                from,
                to
        );

        List<Map<String, Object>> treatmentFrequency = jdbcTemplate.queryForList(
                """
                SELECT
                    t.name AS treatmentType,
                    COUNT(a.appointment_id) AS count
                FROM treatments t
                LEFT JOIN appointments a
                    ON t.treatment_code = a.treatment_code
                    AND a.appointment_date BETWEEN ? AND ?
                GROUP BY t.treatment_code, t.name
                ORDER BY count DESC
                """,
                from,
                to
        );

        Integer totalAppointments = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM appointments
                WHERE appointment_date BETWEEN ? AND ?
                """,
                Integer.class,
                from,
                to
        );

        Map<String, Object> response = new HashMap<>();
        response.put("byDate", byDate);
        response.put("byDentist", byDentist);
        response.put("treatmentFrequency", treatmentFrequency);
        response.put("totalAppointments", totalAppointments);

        return response;
    }
}