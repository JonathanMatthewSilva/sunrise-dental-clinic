package com.sunrisedental.model;

public class Dentist {

    private int dentistId;
    private String name;
    private String specialization;
    private boolean active;

    public Dentist() {
    }

    public Dentist(int dentistId, String name, String specialization, boolean active) {
        this.dentistId = dentistId;
        this.name = name;
        this.specialization = specialization;
        this.active = active;
    }

    public int getDentistId() {
        return dentistId;
    }

    public void setDentistId(int dentistId) {
        this.dentistId = dentistId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}