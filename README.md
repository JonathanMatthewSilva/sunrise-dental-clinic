# Sunrise Dental Clinic Management System

A distributed dental clinic appointment and patient management system developed for the CIS6003 Advanced Programming assessment.

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Java
- Spring Boot
- Spring Security
- Spring JDBC / JdbcTemplate
- MySQL
- Maven
- JUnit 5
- Mockito
- GitHub Actions

## Main Features

- Secure staff login and logout
- Appointment registration
- Unique appointment number generation
- Dentist double-booking prevention
- Appointment search, update and cancellation
- Billing and printable receipts
- Dashboard statistics
- Appointment and revenue reporting
- REST API integration
- Automated testing and CI with GitHub Actions

## Project Structure

- Frontend: HTML, CSS and JavaScript files in the repository root
- Backend: `sunrise-dental/`
- Database: `database/`
- CI workflow: `.github/workflows/maven.yml`

## Testing

The automated Maven regression suite contains 16 tests covering authentication, appointment business rules, billing logic and Spring application startup.

GitHub Actions automatically runs the Maven test suite on pushes and pull requests to the `main` branch.