const admin = require("../config/firebase");
const firestore = require("../config/firestore");
const responseHandler = require("../utils/responseHandler");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10; // Jumlah putaran hashing bcrypt

// Fungsi untuk registrasi pengguna
const register = async (request, h) => {
  try {
    const { email, password, nama } = request.payload;

    // Validasi input
    if (!nama) {
      return responseHandler.error(h, "Nama is required", 400);
    }
    if (!email || !password) {
      return responseHandler.error(h, "Email and password are required", 400);
    }

    // Enkripsi password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Buat pengguna di Firebase Authentication
    const user = await admin.auth().createUser({
      email,
      password, // Firebase membutuhkan password untuk membuat user
    });

    // Simpan data pengguna ke Firestore
    const userRef = firestore.collection("users").doc(user.uid);
    await userRef.set({
      uid: user.uid,
      email: user.email,
      nama,
      hashedPassword, // Simpan password yang telah di-hash
      createdAt: new Date(),
    });

    return responseHandler.success(h, "User registered successfully", {
      uid: user.uid,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return responseHandler.error(h, error.message);
  }
};

// Fungsi untuk login pengguna
const login = async (request, h) => {
  try {
    const { email, password } = request.payload;

    // Validasi input
    if (!email || !password) {
      return responseHandler.error(h, "Email and password are required", 400);
    }

    // Ambil data pengguna dari Firebase Authentication
    const user = await admin.auth().getUserByEmail(email);

    // Ambil data pengguna dari Firestore
    const userRef = firestore.collection("users").doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return responseHandler.error(h, "User not found", 404);
    }

    const userData = userDoc.data();

    // Verifikasi password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(
      password,
      userData.hashedPassword
    );
    if (!isPasswordValid) {
      return responseHandler.error(h, "Invalid credentials", 401);
    }

    // Buat custom token untuk otorisasi
    const token = await admin.auth().createCustomToken(user.uid);

    // Update waktu login terakhir di Firestore
    await userRef.set({ lastLogin: new Date() }, { merge: true });

    return responseHandler.success(h, "Login successful", { token });
  } catch (error) {
    console.error("Login Error:", error);
    return responseHandler.error(h, error.message);
  }
};

module.exports = { register, login };
