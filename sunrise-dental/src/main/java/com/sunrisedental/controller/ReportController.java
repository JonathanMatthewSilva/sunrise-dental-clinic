package com.sunrisedental.controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sunrisedental.service.ReportService;
import com.sunrisedental.service.RevenueReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final RevenueReportService revenueReportService;

    public ReportController(
            ReportService reportService,
            RevenueReportService revenueReportService) {

        this.reportService = reportService;
        this.revenueReportService = revenueReportService;
    }

    @GetMapping("/appointments")
    public Map<String, Object> getAppointmentReport(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        return reportService.getAppointmentReport(from, to);
    }

    @GetMapping("/revenue")
    public Map<String, Object> getRevenueReport(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        return revenueReportService.getRevenueReport(from, to);
    }
}