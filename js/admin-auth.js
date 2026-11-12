/**
 * Foresta Adventure - Admin Authentication Service
 * Mengelola otentikasi khusus administrator untuk proteksi dashboard admin.
 */

const ADMIN_SESSION_KEY = "foresta_admin_session";
const ADMIN_CREDENTIALS = [
  {
    username: "admin",
    email: "admin@forestaadventure.com",
    password: "admin123",
    name: "Admin Logistik & Operasional",
    role: "Basecamp Manager",
    badge: "Super Admin"
  },
  {
    username: "mulyoadv",
    email: "mulyo@forestaadventure.com",
    password: "mulyo2026",
    name: "Pengelola Mulyo Adventure",
    role: "Owner / Administrator",
    badge: "Owner"
  }
];

class AdminAuthService {
  constructor() {
    this.session = this.loadSession();
  }

  loadSession() {
    try {
      const data = sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Gagal memuat sesi admin:", e);
      return null;
    }
  }

  isLoggedIn() {
    return this.session !== null && !!this.session.email;
  }

  getSession() {
    return this.session;
  }

  login(identifier, password, rememberMe = false) {
    const cleanId = (identifier || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    const matched = ADMIN_CREDENTIALS.find(
      (acc) =>
        (acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId) &&
        acc.password === cleanPass
    );

    if (matched) {
      const sessionData = {
        name: matched.name,
        email: matched.email,
        role: matched.role,
        badge: matched.badge,
        loginTime: new Date().toISOString()
      };

      this.session = sessionData;
      const str = JSON.stringify(sessionData);

      if (rememberMe) {
        localStorage.setItem(ADMIN_SESSION_KEY, str);
      } else {
        sessionStorage.setItem(ADMIN_SESSION_KEY, str);
      }

      return {
        success: true,
        session: sessionData
      };
    }

    return {
      success: false,
      message: "Username / Email atau Kata Sandi Admin tidak sesuai. Akses ditolak!"
    };
  }

  logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    this.session = null;
    window.location.href = "admin-login.html";
  }

  /**
   * Guard untuk halaman admin. Jika belum login, redirect ke admin-login.html
   */
  requireAuth(redirectUrl = null) {
    if (!this.isLoggedIn()) {
      const target = redirectUrl || window.location.pathname.split("/").pop() || "admin.html";
      window.location.replace(`admin-login.html?redirect=${encodeURIComponent(target)}`);
      return false;
    }
    return true;
  }
}

// Global instance
const adminAuth = new AdminAuthService();

// Helper global functions
function isForestaAdminLoggedIn() {
  return adminAuth.isLoggedIn();
}

function getForestaAdminSession() {
  return adminAuth.getSession();
}

function logoutForestaAdmin() {
  adminAuth.logout();
}

