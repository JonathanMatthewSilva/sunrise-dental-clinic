package com.sunrisedental.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sunrisedental.dao.DentistDao;
import com.sunrisedental.model.Dentist;

@Service
public class DentistService {

    private final DentistDao dentistDao;

    public DentistService(DentistDao dentistDao) {
        this.dentistDao = dentistDao;
    }

    public List<Dentist> getActiveDentists() {
        return dentistDao.findAllActive();
    }
}