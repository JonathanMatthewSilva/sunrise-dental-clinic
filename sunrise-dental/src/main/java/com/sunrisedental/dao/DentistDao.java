package com.sunrisedental.dao;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.sunrisedental.model.Dentist;

@Repository
public class DentistDao {

    private final JdbcTemplate jdbcTemplate;

    public DentistDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Dentist> findAllActive() {
        String sql = """
                SELECT dentist_id, name, specialization, active
                FROM dentists
                WHERE active = TRUE
                ORDER BY name
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new Dentist(
                        rs.getInt("dentist_id"),
                        rs.getString("name"),
                        rs.getString("specialization"),
                        rs.getBoolean("active")
                )
        );
    }
}