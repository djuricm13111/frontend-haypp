import React, {
  useState,
  createContext,
  useEffect,
  useRef,
  useContext,
} from "react";
import { jwtDecode } from "jwt-decode";
import TagManager from "react-gtm-module";

import { useNavigation } from "../utils/navigation";
import APIService from "../services/APIService";
import { useNavigate } from "react-router-dom";

export const AuthUserContext = createContext();
export const AuthUserProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  const [emailUser, setEmailUser] = useState(() =>
    localStorage.getItem("emailUser")
      ? JSON.parse(localStorage.getItem("emailUser"))
      : null
  );
  const [userProfile, setUserProfile] = useState(null);
  const [userPointsHistory, setUserPointsHistory] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const [location, setLocation] = useState({ country: "", countryCode: "" });
  const { goToHome, goToLogin, goToVerification } = useNavigation();
  const refreshTokenTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authTokens) {
      const decoded = jwtDecode(authTokens.access);
      const expiry = new Date(decoded.exp * 1000);
      const now = new Date();

      if (expiry < now) {
        refreshToken();
      } else {
        const timeout = expiry.getTime() - now.getTime() - 60 * 1000; // Osvežava token 1 minut pre isteka
        //setTimeout(refreshToken, timeout);
        refreshTokenTimeoutRef.current = setTimeout(refreshToken, timeout);
      }
    }
  }, [authTokens]);
  useEffect(() => {
    if (authTokens) {
      refreshToken();
    }
  }, []);

  const refreshToken = async () => {
    //console.log("refresh token");
    try {
      const response = await APIService.RefreshToken(authTokens.refresh);
      const updatedTokens = {
        ...authTokens,
        access: response.access,
      };
      setAuthTokens(updatedTokens);
      localStorage.setItem("authTokens", JSON.stringify(updatedTokens));
    } catch (error) {
      console.error(error);
      logoutUser();
    }
  };
  let handleGoogleLogin = async (token) => {
    try {
      const response = await APIService.GoogleLogin(token);
      setAuthTokens({ access: response.access, refresh: response.refresh });
      localStorage.setItem(
        "authTokens",
        JSON.stringify({ access: response.access, refresh: response.refresh })
      );
      const decoded = jwtDecode(response.access);
      TagManager.dataLayer({
        dataLayer: {
          event: "login",
          email: decoded.email,
          user_id: decoded.user_id,
          method: "Google",
        },
      });
    } catch (error) {
      // Umesto direktnog obrađivanja grešaka, baca ih dalje
      throw error;
    }
  };

  let loginUser = async (email, password = null) => {
    try {
      const response = await APIService.Login(email, password);
      setAuthTokens({ access: response.access, refresh: response.refresh });
      localStorage.setItem(
        "authTokens",
        JSON.stringify({ access: response.access, refresh: response.refresh })
      );
      const decoded = jwtDecode(response.access);
      TagManager.dataLayer({
        dataLayer: {
          event: "login",
          email: decoded.email,
          user_id: decoded.user_id,
          method: "Manual",
        },
      });
    } catch (error) {
      // Umesto direktnog obrađivanja grešaka, baca ih dalje
      throw error;
    }
  };

  let logoutUser = () => {
    invalidateUserProfileCache();
    setAuthTokens(null);
    localStorage.removeItem("authTokens");
    if (refreshTokenTimeoutRef.current) {
      clearTimeout(refreshTokenTimeoutRef.current); // Čišćenje timeout-a prilikom logouta
    }
    navigate(goToHome());
  };
  const registerUser = async (email, name, surname, password, referralCode) => {
    const registerResponse = await APIService.Register(
      email,
      name,
      surname,
      password,
      referralCode
    );

    setAuthTokens({
      access: registerResponse.access,
      refresh: registerResponse.refresh,
    });
    localStorage.setItem(
      "authTokens",
      JSON.stringify({
        access: registerResponse.access,
        refresh: registerResponse.refresh,
      })
    );
    return registerResponse;
  };

  let checkLoginAndVerification = async () => {
    if (authTokens) {
      try {
        const decoded = jwtDecode(authTokens.access);
        console.log(decoded.is_email_verified);
        if (!decoded.is_email_verified) {
          navigate(goToVerification());
        }
      } catch (error) {
        console.error("Greška pri dekodiranju tokena:", error);
      }
    } else {
      navigate(goToLogin());
    }
  };

  async function fetchUserData(accessTokenOverride = null) {
    try {
      const token = accessTokenOverride || authTokens?.access;
      if (!token) return;
      const profileData = await APIService.getUserProfile(token);
      //console.log("User Data:", profileData);
      setUserProfile(profileData);
      // Postavite dobijene podatke u stanje komponente ili ih koristite na drugi način
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 401) {
        // Token je istekao ili je nevažeći
        setAuthTokens(null);
        localStorage.removeItem("authTokens");
        navigate(goToHome());
      }
    }
  }
  const updateUserInfo = async (userInfo, accessTokenOverride = null) => {
    try {
      const token = accessTokenOverride || authTokens?.access;
      if (!token) throw new Error("No access token");
      const response = await APIService.updateUserInfo(userInfo, token);

      let base = userProfile;
      if (!base) {
        try {
          const raw = localStorage.getItem("userProfileData");
          base = raw ? JSON.parse(raw) : {};
        } catch {
          base = {};
        }
      }
      const updatedUserProfile = { ...base };
      if (userInfo.first_name !== undefined)
        updatedUserProfile.first_name = userInfo.first_name;
      if (userInfo.last_name !== undefined)
        updatedUserProfile.last_name = userInfo.last_name;
      if (userInfo.phone_number !== undefined)
        updatedUserProfile.phone_number = userInfo.phone_number;

      setUserProfile(updatedUserProfile);

      // Čuvanje ažuriranih podataka u localStorage
      localStorage.setItem(
        "userProfileData",
        JSON.stringify(updatedUserProfile)
      );

      return response.data;
    } catch (error) {
      console.error("Error updating user info:", error);
      throw error;
    }
  };

  async function fetchUserPointsHistory() {
    try {
      const pointsData = await APIService.getUserPointsHistory(
        authTokens.access
      );
      //console.log("Points Data:", pointsData);
      setUserPointsHistory(pointsData);
      // Postavite dobijene podatke u stanje komponente ili ih koristite na drugi način
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  function invalidateUserProfileCache() {
    const cacheKey = "userProfileData";
    localStorage.removeItem(cacheKey);
  }

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await APIService.ChangePassword(
        oldPassword,
        newPassword
      );
      // Ovde možete ažurirati authState ili obaviti neku drugu akciju nakon uspešne promene lozinke
      return response;
    } catch (error) {
      // Obrada greške
      throw error;
    }
  };

  // Funkcija za ažuriranje adrese
  const updateAddressBook = async (
    addressId,
    addressData,
    accessTokenOverride = null
  ) => {
    try {
      const accessToken = accessTokenOverride || authTokens?.access;
      if (!accessToken) throw new Error("No access token");
      const updatedAddress = await APIService.updateAddressBook(
        addressId,
        addressData,
        accessToken
      );

      let base = userProfile;
      if (!base) {
        try {
          const raw = localStorage.getItem("userProfileData");
          base = raw ? JSON.parse(raw) : { addresses: [] };
        } catch {
          base = { addresses: [] };
        }
      }
      const updatedUserProfile = { ...base };
      if (!Array.isArray(updatedUserProfile.addresses)) {
        updatedUserProfile.addresses = [];
      }
      if (addressData.is_primary) {
        updatedUserProfile.addresses.forEach((address) => {
          if (address.is_primary) {
            address.is_primary = false;
          }
        });
      }
      const addressIndex = updatedUserProfile.addresses.findIndex(
        (addr) => addr.id.toString() === addressId.toString()
      );

      if (addressIndex > -1) {
        updatedUserProfile.addresses[addressIndex] = updatedAddress;
      } else {
        updatedUserProfile.addresses.push(updatedAddress);
      }

      setUserProfile(updatedUserProfile);

      localStorage.setItem(
        "userProfileData",
        JSON.stringify(updatedUserProfile)
      );

      return updatedAddress;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error; // Ili obradite grešku na način koji vam odgovara
    }
  };

  const deleteAddressBook = async (addressId) => {
    try {
      const accessToken = authTokens.access;
      await APIService.deleteAddressBook(addressId, accessToken);

      const updatedUserProfile = { ...userProfile };
      const addressIndex = updatedUserProfile.addresses.findIndex(
        (addr) => addr.id.toString() === addressId.toString()
      );

      if (addressIndex > -1) {
        // Uklonite adresu iz niza adresa
        updatedUserProfile.addresses.splice(addressIndex, 1);
      }

      setUserProfile(updatedUserProfile);

      localStorage.setItem(
        "userProfileData",
        JSON.stringify(updatedUserProfile)
      );

      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error; // Ili obradite grešku na način koji vam odgovara
    }
  };

  // Funkcija za kreiranje adrese
  const createAddressBook = async (addressData, accessTokenData = null) => {
    try {
      let accessToken;

      if (accessTokenData) {
        accessToken = accessTokenData; // Koristimo prosleđeni `accessTokenData`
      } else {
        accessToken = authTokens.access; // Koristimo `authTokens.access`
      }
      const createdAddress = await APIService.createAddressBook(
        addressData,
        accessToken
      );

      let base = userProfile;
      if (!base) {
        try {
          const raw = localStorage.getItem("userProfileData");
          base = raw ? JSON.parse(raw) : {};
        } catch {
          base = {};
        }
      }
      const updatedUserProfile = { ...base };
      if (!Array.isArray(updatedUserProfile.addresses)) {
        updatedUserProfile.addresses = [];
      }

      if (!updatedUserProfile.phone_number && addressData.phone_number) {
        updatedUserProfile.phone_number = addressData.phone_number;
      }

      if (addressData.is_primary) {
        updatedUserProfile.addresses.forEach((address) => {
          if (address.is_primary) {
            address.is_primary = false;
          }
        });
      }

      updatedUserProfile.addresses.push(createdAddress);

      // Ažurirajte userProfile u kontekstu/state-u aplikacije
      setUserProfile(updatedUserProfile);

      // Ažurirajte userProfile u localStorage
      localStorage.setItem(
        "userProfileData",
        JSON.stringify(updatedUserProfile)
      );

      return createdAddress;
    } catch (error) {
      console.error("Error creating new address:", error);
      throw error; // Ili obradite grešku na način koji vam odgovara
    }
  };
  const createVoucher = async (voucherData) => {
    try {
      const accessToken = authTokens.access;
      const createdVoucher = await APIService.createVoucher(
        voucherData,
        accessToken
      );

      // Kopirajte trenutni userProfile kako biste napravili izmene
      const updatedUserProfile = { ...userProfile };

      updatedUserProfile.points =
        updatedUserProfile.points - voucherData.points;

      // Dodajte novu adresu u listu adresa
      updatedUserProfile.vouchers.push(createdVoucher);

      // Ažurirajte userProfile u kontekstu/state-u aplikacije
      setUserProfile(updatedUserProfile);

      // Ažurirajte userProfile u localStorage
      localStorage.setItem(
        "userProfileData",
        JSON.stringify(updatedUserProfile)
      );

      return createdVoucher;
    } catch (error) {
      console.error("Error creating new address:", error);
      throw error; // Ili obradite grešku na način koji vam odgovara
    }
  };
  const handleSelectCard = (cardId) => {
    setSelectedCard(cardId);
    // Nastavi proces plaćanja sa izabranom karticom
  };

  let values = {
    authTokens,
    handleGoogleLogin,
    loginUser,
    logoutUser,
    registerUser,
    fetchUserData,
    updateUserInfo,
    checkLoginAndVerification,

    changePassword,
    invalidateUserProfileCache,
    userProfile,
    setUserProfile,
    updateAddressBook,
    deleteAddressBook,
    createAddressBook,
    createVoucher,

    fetchUserPointsHistory,
    userPointsHistory,

    location,
    setLocation,
    //za verifikaciju samo
    setAuthTokens,
    //checkout
    selectedCard,
    handleSelectCard,
  };

  return (
    <AuthUserContext.Provider value={values}>
      {children}
    </AuthUserContext.Provider>
  );
};
