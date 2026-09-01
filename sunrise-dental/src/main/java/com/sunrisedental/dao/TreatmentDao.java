package com.sunrisedental.dao;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.sunrisedental.model.Treatment;

@Repository
public class TreatmentDao {

    private final JdbcTemplate jdbcTemplate;

    public TreatmentDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Treatment> findAllActive() {
        String sql = """
                SELECT treatment_code, name, treatment_fee, active
                FROM treatments
                WHERE active = TRUE
                ORDER BY name
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new Treatment(
                        rs.getString("treatment_code"),
                        rs.getString("name"),
                        rs.getBigDecimal("treatment_fee"),
                        rs.getBoolean("active")
                )
        );
    }
}