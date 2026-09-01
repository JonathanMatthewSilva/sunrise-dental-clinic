const Api = (function () {
  "use strict";

  const config = {
    BASE_URL: "http://localhost:8080/api",
    USE_MOCK_FALLBACK: false,
    REQUEST_TIMEOUT_MS: 8000
  };

  const endpoints = {
    login: () => "/auth/login",
    logout: () => "/auth/logout",
    createAppointment: () => "/appointments",
    getAppointment: (no) => "/appointments/" + encodeURIComponent(no),
    updateAppointment: (no) => "/appointments/" + encodeURIComponent(no),
    cancelAppointment: (no) => "/appointments/" + encodeURIComponent(no),
    generateBill: (no) => "/bills/" + encodeURIComponent(no),
    getBill: (no) => "/bills/" + encodeURIComponent(no),
    dashboardSummary: () => "/dashboard/summary",
    dentists: () => "/dentists",
    treatments: () => "/treatments",
    reportAppointments: (qs) =>
      "/reports/appointments" + (qs ? "?" + qs : ""),
    reportRevenue: (qs) =>
      "/reports/revenue" + (qs ? "?" + qs : "")
  };

  function ApiError(message, status, payload) {
    this.name = "ApiError";
    this.message = message || "Unable to reach the server.";
    this.status = status || 0;
    this.payload = payload || null;
  }

  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  async function request(path, options) {
    options = options || {};

    const controller = new AbortController();

    const timer = setTimeout(function () {
      controller.abort();
    }, config.REQUEST_TIMEOUT_MS);

    const init = {
      method: options.method || "GET",
      headers: Object.assign(
        {
          Accept: "application/json"
        },
        options.body
          ? {
              "Content-Type": "application/json"
            }
          : {},
        options.headers || {}
      ),
      credentials: "include",
      signal: controller.signal
    };

    if (options.body) {
      init.body = JSON.stringify(options.body);
    }

    let response;

    try {
      response = await fetch(
        config.BASE_URL + path,
        init
      );
    } catch (networkError) {
      clearTimeout(timer);

      if (
        config.USE_MOCK_FALLBACK &&
        window.MockData
      ) {
        config.mockActive = true;

        window.dispatchEvent(
          new CustomEvent("api:mock-used")
        );

        return window.MockData.resolve(
          path,
          init
        );
      }

      throw new ApiError(
        "Cannot connect to the Sunrise Dental server.",
        0,
        null
      );
    }

    clearTimeout(timer);

    let payload = null;
    const text = await response.text();

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (error) {
        payload = {
          message: text
        };
      }
    }

    if (response.status === 401) {
      handleUnauthorized(path);

      const message =
        payload &&
        (payload.message || payload.error)
          ? payload.message || payload.error
          : "Your session has expired. Please sign in again.";

      throw new ApiError(
        message,
        401,
        payload
      );
    }

    if (!response.ok) {
      const message =
        payload &&
        (payload.message || payload.error)
          ? payload.message || payload.error
          : "Request failed (HTTP " +
            response.status +
            ")";

      throw new ApiError(
        message,
        response.status,
        payload
      );
    }

    return payload;
  }

  function handleUnauthorized(path) {
    if (path === endpoints.login()) {
      return;
    }

    sessionStorage.removeItem(
      "sunriseDentalUser"
    );

    sessionStorage.removeItem(
      "sunrise-dental-user"
    );

    if (
      !window.location.pathname.endsWith(
        "login.html"
      )
    ) {
      window.location.replace(
        "login.html?expired=1"
      );
    }
  }

  const get = function (path) {
    return request(path, {
      method: "GET"
    });
  };

  const post = function (path, body) {
    return request(path, {
      method: "POST",
      body: body
    });
  };

  const put = function (path, body) {
    return request(path, {
      method: "PUT",
      body: body
    });
  };

  const del = function (path) {
    return request(path, {
      method: "DELETE"
    });
  };

  function toQuery(params) {
    if (!params) {
      return "";
    }

    return Object.keys(params)
      .filter(function (key) {
        return (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        );
      })
      .map(function (key) {
        return (
          encodeURIComponent(key) +
          "=" +
          encodeURIComponent(params[key])
        );
      })
      .join("&");
  }

  return {
    config: config,
    endpoints: endpoints,
    ApiError: ApiError,
    request: request,

    login: function (credentials) {
      return post(
        endpoints.login(),
        credentials
      );
    },

    logout: function () {
      return post(
        endpoints.logout(),
        {}
      );
    },

    getDashboardSummary: function () {
      return get(
        endpoints.dashboardSummary()
      );
    },

    getDentists: function () {
      return get(
        endpoints.dentists()
      );
    },

    getTreatments: function () {
      return get(
        endpoints.treatments()
      );
    },

    createAppointment: function (
      appointment
    ) {
      return post(
        endpoints.createAppointment(),
        appointment
      );
    },

    getAppointment: function (no) {
      return get(
        endpoints.getAppointment(no)
      );
    },

    updateAppointment: function (
      no,
      appointment
    ) {
      return put(
        endpoints.updateAppointment(no),
        appointment
      );
    },

    cancelAppointment: function (no) {
      return del(
        endpoints.cancelAppointment(no)
      );
    },

    generateBill: function (no) {
      return post(
        endpoints.generateBill(no),
        {}
      );
    },

    getBill: function (no) {
      return get(
        endpoints.getBill(no)
      );
    },

    getAppointmentReports: function (
      params
    ) {
      return get(
        endpoints.reportAppointments(
          toQuery(params)
        )
      );
    },

    getRevenueReport: function (
      params
    ) {
      return get(
        endpoints.reportRevenue(
          toQuery(params)
        )
      );
    }
  };
})();

window.Api = Api;