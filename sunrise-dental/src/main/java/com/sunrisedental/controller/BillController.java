package com.sunrisedental.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sunrisedental.dto.BillResponse;
import com.sunrisedental.service.BillService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/{appointmentNumber}")
    public ResponseEntity<?> generateBill(
            @PathVariable String appointmentNumber,
            HttpSession session) {

        Object userIdObject = session.getAttribute("userId");

        if (userIdObject == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Please sign in before generating a bill."
                    ));
        }

        int userId = (int) userIdObject;

        BillResponse bill = billService.generateBill(
                appointmentNumber,
                userId
        );

        return ResponseEntity.ok(bill);
    }

    @GetMapping("/{appointmentNumber}")
    public ResponseEntity<?> getBill(
            @PathVariable String appointmentNumber) {

        BillResponse bill = billService.getBill(
                appointmentNumber
        );

        return ResponseEntity.ok(bill);
    }
}