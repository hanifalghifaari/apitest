const firestore = require("../config/firestore");

// Ambil pengguna berdasarkan UID
const getUserById = async (uid) => {
  const userDoc = await firestore.collection("users").doc(uid).get();
  return userDoc.exists ? userDoc.data() : null;
};

// Tambahkan pengguna baru
const addUser = async (uid, data) => {
  const userRef = firestore.collection("users").doc(uid);
  await userRef.set(data);
  return { uid, ...data };
};

module.exports = { getUserById, addUser };
