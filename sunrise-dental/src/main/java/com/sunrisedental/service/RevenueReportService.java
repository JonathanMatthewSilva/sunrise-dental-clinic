package com.sunrisedental.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class RevenueReportService {

    private final JdbcTemplate jdbcTemplate;

    public RevenueReportService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getRevenueReport(
            LocalDate from,
            LocalDate to) {

        BigDecimal totalRevenue = jdbcTemplate.queryForObject(
                """
                SELECT COALESCE(SUM(b.total_amount), 0)
                FROM bills b
                JOIN appointments a
                    ON b.appointment_id = a.appointment_id
                WHERE a.appointment_date BETWEEN ? AND ?
                """,
                BigDecimal.class,
                from,
                to
        );

        Integer billsIssued = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM bills b
                JOIN appointments a
                    ON b.appointment_id = a.appointment_id
                WHERE a.appointment_date BETWEEN ? AND ?
                """,
                Integer.class,
                from,
                to
        );

        BigDecimal averageBillValue = jdbcTemplate.queryForObject(
                """
                SELECT COALESCE(AVG(b.total_amount), 0)
                FROM bills b
                JOIN appointments a
                    ON b.appointment_id = a.appointment_id
                WHERE a.appointment_date BETWEEN ? AND ?
                """,
                BigDecimal.class,
                from,
                to
        );

        BigDecimal outstanding = jdbcTemplate.queryForObject(
                """
                SELECT COALESCE(SUM(b.total_amount), 0)
                FROM bills b
                JOIN appointments a
                    ON b.appointment_id = a.appointment_id
                WHERE a.appointment_date BETWEEN ? AND ?
                  AND b.payment_status = 'UNPAID'
                """,
                BigDecimal.class,
                from,
                to
        );

        List<Map<String, Object>> byDay = jdbcTemplate.queryForList(
                """
                SELECT
                    a.appointment_date AS date,
                    COUNT(b.bill_id) AS bills,
                    COALESCE(SUM(b.total_amount), 0) AS revenue
                FROM bills b
                JOIN appointments a
                    ON b.appointment_id = a.appointment_id
                WHERE a.appointment_date BETWEEN ? AND ?
                GROUP BY a.appointment_date
                ORDER BY a.appointment_date
                """,
                from,
                to
        );

        List<Map<String, Object>> byTreatment = jdbcTemplate.queryForList(
                """
                SELECT
                    t.name AS treatmentType,
                    COUNT(b.bill_id) AS bills,
                    COALESCE(SUM(b.total_amount), 0) AS revenue
                FROM bills b
                JOIN appointments a
                    ON b.appointment_id = a.appointment_id
                JOIN treatments t
                    ON a.treatment_code = t.treatment_code
                WHERE a.appointment_date BETWEEN ? AND ?
                GROUP BY t.treatment_code, t.name
                ORDER BY revenue DESC
                """,
                from,
                to
        );

        Map<String, Object> response = new HashMap<>();

        response.put("totalRevenue", totalRevenue);
        response.put("billsIssued", billsIssued);
        response.put("averageBillValue", averageBillValue);
        response.put("outstanding", outstanding);
        response.put("currency", "LKR");
        response.put("byDay", byDay);
        response.put("byTreatment", byTreatment);

        return response;
    }
}