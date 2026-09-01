package com.sunrisedental.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sunrisedental.dto.AppointmentRequest;
import com.sunrisedental.dto.AppointmentResponse;
import com.sunrisedental.service.AppointmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(
            @Valid @RequestBody AppointmentRequest request) {

        AppointmentResponse appointment =
                appointmentService.createAppointment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(appointment);
    }

    @GetMapping("/{appointmentNumber}")
    public ResponseEntity<?> getAppointment(
            @PathVariable String appointmentNumber) {

        Optional<AppointmentResponse> appointment =
                appointmentService.findAppointment(appointmentNumber);

        if (appointment.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Appointment not found."
                    ));
        }

        return ResponseEntity.ok(
                appointment.get()
        );
    }

    @PutMapping("/{appointmentNumber}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable String appointmentNumber,
            @Valid @RequestBody AppointmentRequest request) {

        AppointmentResponse appointment =
                appointmentService.updateAppointment(
                        appointmentNumber,
                        request
                );

        return ResponseEntity.ok(appointment);
    }

    @DeleteMapping("/{appointmentNumber}")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable String appointmentNumber) {

        boolean cancelled =
                appointmentService.cancelAppointment(
                        appointmentNumber
                );

        if (!cancelled) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Appointment not found or already cancelled."
                    ));
        }

        return ResponseEntity.ok(
                Map.of(
                        "appointmentNumber",
                        appointmentNumber,
                        "status",
                        "CANCELLED",
                        "message",
                        "Appointment cancelled successfully."
                )
        );
    }
}