import axios from "axios";
import i18next from "i18next";
import { DEFAULT_CURRENCY } from "../utils/global_const";

const defaultCurrency = DEFAULT_CURRENCY;

/**
 * REST rute na backendu za listinge (isti endpointi koje koristi početna / ShopListing).
 * Mora ostati usklađeno sa Django/API rutama.
 */
export const API_PRODUCT_LISTINGS = {
  BEST_SELLERS: "api/products/best-sellers/",
  NEW_ARRIVALS: "api/products/new-arrivals/",
  MIX_PACKS: "api/products/mix-packs/",
};

/** Kategorije / brendovi u ponudi — `GET api/categories/` */
export const API_CATEGORIES = "api/categories/";

/** Niz kategorija iz odgovora (paginacija / omotač). */
export function normalizeCategoriesListResponse(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.categories)) return payload.categories;
  return [];
}

/** Backend ponekad vraća niz, ponekad `{ results: [...] }` (paginacija). */
export function normalizeProductListResponse(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.products)) return payload.products;
  return [];
}

const DEFAULT_ENDPOINT =
  window.location.protocol === "https:"
    ? "https://api.maskkingsrbija.com/"
    : "http://127.0.0.1:8000/";

// 2) Učitaj iz .env (CRA zahteva REACT_APP_ prefiks)
const BACKEND_API_ENDPOINT =
  process.env.REACT_APP_BACKEND_API_ENDPOINT || DEFAULT_ENDPOINT;

export default class APIService {
  static URL = BACKEND_API_ENDPOINT;
  
  static async GetProducts() {
    const language = i18next.language.toLowerCase(); // Pretpostavljamo da i18next upravlja trenutnim jezikom
    const currency = localStorage.getItem("currency") || defaultCurrency;
    const response = await axios.get(APIService.URL + `api/products/`, {
      headers: {
        "Accept-Language": language,
        Currency: currency,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  /**
   * Kategorije (brendovi) u ponudi — ista ruta kao na backendu.
   * @param {string} [locale] — npr. `"de"` | `"en"` za Accept-Language
   */
  static async GetCategories(locale) {
    const language = String(locale ?? i18next.language ?? "en").toLowerCase();
    const response = await axios.get(APIService.URL + API_CATEGORIES, {
      headers: {
        "Accept-Language": language,
        "Content-Type": "application/json",
      },
    });
    return normalizeCategoriesListResponse(response.data);
  }
  /**
   * @param {string} [locale] — npr. `"de"` | `"en"`; ako nije prosleđen, koristi i18next (Accept-Language za backend).
   */
  static async GetBestSellers(locale) {
    const language = String(locale ?? i18next.language ?? "en").toLowerCase();
    const currency = localStorage.getItem("currency") || defaultCurrency;
    const response = await axios.get(
      APIService.URL + API_PRODUCT_LISTINGS.BEST_SELLERS,
      {
        headers: {
          "Accept-Language": language,
          Currency: currency,
          "Content-Type": "application/json",
        },
      }
    );
    return normalizeProductListResponse(response.data);
  }

  /**
   * @param {string} [locale] — npr. `"de"` | `"en"`; ako nije prosleđen, koristi i18next.
   */
  static async GetNewArrivals(locale) {
    const language = String(locale ?? i18next.language ?? "en").toLowerCase();
    const currency = localStorage.getItem("currency") || defaultCurrency;
    const response = await axios.get(
      APIService.URL + API_PRODUCT_LISTINGS.NEW_ARRIVALS,
      {
        headers: {
          "Accept-Language": language,
          Currency: currency,
          "Content-Type": "application/json",
        },
      }
    );
    return normalizeProductListResponse(response.data);
  }

  /**
   * @param {string} [locale] — npr. `"de"` | `"en"`
   */
  static async GetMixPacks(locale) {
    const language = String(locale ?? i18next.language ?? "en").toLowerCase();
    const currency = localStorage.getItem("currency") || defaultCurrency;
    const response = await axios.get(APIService.URL + API_PRODUCT_LISTINGS.MIX_PACKS, {
      headers: {
        "Accept-Language": language,
        Currency: currency,
        "Content-Type": "application/json",
      },
    });
    return normalizeProductListResponse(response.data);
  }

  static async GetProductsByCategory(slug) {
    const language = i18next.language.toLowerCase(); // Pretpostavljamo da i18next upravlja trenutnim jezikom
    const currency = localStorage.getItem("currency") || defaultCurrency;
    try {
      const response = await axios.get(
        `${this.URL}api/category/${encodeURIComponent(slug)}/`,
        {
        headers: {
          "Accept-Language": language,
          Currency: currency,
          "Content-Type": "application/json",
        },
      }
      );
      return response.data; // Očekuje se da će ovaj poziv vratiti detalje o pojedinačnom proizvodu
    } catch (error) {
      throw error;
    }
  }

  static async GetProductBySlug(slug) {
    const language = i18next.language.toLowerCase(); // Pretpostavljamo da i18next upravlja trenutnim jezikom
    const currency = localStorage.getItem("currency") || defaultCurrency;
    try {
      const response = await axios.get(
        `${this.URL}api/products/${encodeURIComponent(slug)}/`,
        {
        headers: {
          "Accept-Language": language,
          Currency: currency,
          "Content-Type": "application/json",
        },
      }
      );
      return response.data; // Očekuje se da će ovaj poziv vratiti detalje o pojedinačnom proizvodu
    } catch (error) {
      throw error;
    }
  }
  static async GetRecommendedProductsBySlug(slug) {
    const language = i18next.language.toLowerCase(); // Pretpostavljamo da i18next upravlja trenutnim jezikom
    const currency = localStorage.getItem("currency") || defaultCurrency;
    try {
      const response = await axios.get(
        `${this.URL}api/products/${encodeURIComponent(slug)}/recommended/`,
        {
          headers: {
            "Accept-Language": language,
            Currency: currency,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Očekuje se da će ovaj poziv vratiti detalje o pojedinačnom proizvodu
    } catch (error) {
      throw error;
    }
  }

  static async SearchProducts(query, opts = {}) {
    const language = String(opts.language ?? i18next.language ?? "en")
      .toLowerCase()
      .split("-")[0];
    const currency = localStorage.getItem("currency") || defaultCurrency;
    try {
      const response = await axios.get(`${this.URL}api/search/`, {
        params: {
          search: query,
        },
        headers: {
          "Accept-Language": language,
          Currency: currency,
          "Content-Type": "application/json",
        },
      });
      return response.data; // Očekuje se da će ovaj poziv vratiti listu proizvoda koji odgovaraju kriterijumima pretrage
    } catch (error) {
      throw error;
    }
  }
  static async createOrder(orderData, accessToken = null) {
    const language = i18next.language.toLowerCase(); // Pretpostavljamo da i18next upravlja trenutnim jezikom
    const currency = localStorage.getItem("currency") || defaultCurrency;
    try {
      const headers = {
        "Content-Type": "application/json",
        "Accept-Language": language,
        Currency: currency,
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const response = await axios.post(
        `${this.URL}api/orders/create/`,
        orderData,
        { headers }
      );
      return response.data; // Očekuje se da backend vraća ažuriranu adresu
    } catch (error) {
      throw error;
    }
  }

  static async listSubscriptions(accessToken) {
    const language = i18next.language.toLowerCase();
    const currency = localStorage.getItem("currency") || defaultCurrency;
    const response = await axios.get(`${this.URL}api/subscriptions/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept-Language": language,
        Currency: currency,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  static async createSubscription(payload, accessToken) {
    const language = i18next.language.toLowerCase();
    const currency = localStorage.getItem("currency") || defaultCurrency;
    const response = await axios.post(`${this.URL}api/subscriptions/`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept-Language": language,
        Currency: currency,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  static async cancelSubscription(subscriptionId, accessToken) {
    const language = i18next.language.toLowerCase();
    const currency = localStorage.getItem("currency") || defaultCurrency;
    const response = await axios.post(
      `${this.URL}api/subscriptions/${subscriptionId}/cancel/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Accept-Language": language,
          Currency: currency,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  static async addSubscriptionItem(subscriptionId, body, accessToken) {
    const language = i18next.language.toLowerCase();
    const currency = localStorage.getItem("currency") || defaultCurrency;
    const response = await axios.post(
      `${this.URL}api/subscriptions/${subscriptionId}/items/`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Accept-Language": language,
          Currency: currency,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  static async deleteSubscriptionItem(subscriptionId, itemId, accessToken) {
    const language = i18next.language.toLowerCase();
    const currency = localStorage.getItem("currency") || defaultCurrency;
    const response = await axios.delete(
      `${this.URL}api/subscriptions/${subscriptionId}/items/${itemId}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Accept-Language": language,
          Currency: currency,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  //USER
  static async VerifyCode(code, accessToken) {
    try {
      const response = await axios.post(
        `${this.URL}api/verify-code/`,
        { code: code },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Koristite access token za autorizaciju
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  static async ResendVerification(email) {
    const language = i18next.language.toLowerCase();
    try {
      const response = await axios.post(
        `${this.URL}api/resend-verification-code/`,
        { email: email },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": language,
          },
        }
      );
      return response.data; // Očekuje se da backend vraća poruku o uspešnosti
    } catch (error) {
      throw error;
    }
  }

  static async GoogleLogin(token) {
    try {
      const response = await axios.post(
        `${this.URL}api/google-login/`,
        {
          token: token,
        },
        {
          headers: {
          },
        }
      );

      // Ako je odgovor uspešan, axios će automatski parsirati JSON, tako da možete direktno vratiti data
      return response.data;
    } catch (error) {
      console.error("Greška prilikom autentifikacije sa Google: ", error);
      throw error;
    }
  }
  static async Login(email, password) {
    try {
      const response = await axios.post(`${this.URL}api/token/`, {
        email: email,
        password: password,
      });
      return response.data; // Očekuje se da backend vraća objekat sa access i refresh tokenima
    } catch (error) {
      throw error;
    }
  }
  static async Register(
    email,
    firstName,
    lastName,
    password,
    referralCode = null
  ) {
    try {
      const requestBody = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        password: password,
      };

      // Dodajte referal kod u zahtev samo ako je dostavljen
      if (referralCode) {
        requestBody.referral_code = referralCode;
      }

      const response = await axios.post(
        `${this.URL}api/register/`,
        requestBody,
        {
          headers: {
          },
        }
      );
      return response.data; // Očekuje se da backend vraća neki objekat kao odgovor na uspešnu registraciju
    } catch (error) {
      throw error;
    }
  }

  static async RefreshToken(refreshToken) {
    try {
      const response = await axios.post(`${this.URL}api/token/refresh/`, {
        refresh: refreshToken,
      });
      return response.data; // Očekuje se da backend vraća novi access token
    } catch (error) {
      throw error;
    }
  }

  static async getUserProfile(accessToken) {
    const cacheKey = "userProfileData";
    // Proverite da li su podaci već cache-irani
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      //return JSON.parse(cachedData); // Vraćanje cache-iranih podataka
    }
    const currency = localStorage.getItem("currency") || defaultCurrency;
    try {
      const response = await axios.get(`${this.URL}api/user/profile/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Currency: currency,
        },
      });

      // Cache-iranje dobijenih podataka
      localStorage.setItem(cacheKey, JSON.stringify(response.data));
      return response.data; // Vraćanje dobijenih podataka
    } catch (error) {
      throw error;
    }
  }
  static async updateUserInfo(data, accessToken) {
    try {
      const response = await axios.post(
        `${this.URL}api/user/profile/update/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Koristite access token za autorizaciju
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Očekuje se da backend vraća ažuriranu adresu
    } catch (error) {
      throw error;
    }
  }

  static async ChangePassword(oldPassword, newPassword) {
    try {
      // Pretpostavimo da korisnikov token već postoji u localStorage-u ili nekom drugom storage-u
      const token = JSON.parse(localStorage.getItem("authTokens")).access;

      const response = await axios.post(
        `${this.URL}api/change-password/`,
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Dodajte token u Authorization header za autentikaciju
          },
        }
      );

      return response.data; // Očekuje se poruka o uspešnoj promeni lozinke
    } catch (error) {
      throw error;
    }
  }
  static async updateAddressBook(addressId, addressData, accessToken) {
    console.log("azuriram", addressData);
    try {
      const response = await axios.post(
        `${this.URL}api/address-book/${addressId}/update/`,
        addressData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Koristite access token za autorizaciju
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Očekuje se da backend vraća ažuriranu adresu
    } catch (error) {
      throw error;
    }
  }
  static async deleteAddressBook(addressId, accessToken) {
    try {
      const response = await axios.delete(
        `${this.URL}api/address-book/${addressId}/update/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Koristite access token za autorizaciju
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Očekuje se da backend vraća ažuriranu adresu
    } catch (error) {
      throw error;
    }
  }
  static async createAddressBook(addressData, accessToken) {
    try {
      const response = await axios.post(
        `${this.URL}api/address-book/create/`,
        addressData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Koristite access token za autorizaciju
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Očekuje se da backend vraća ažuriranu adresu
    } catch (error) {
      throw error;
    }
  }
  static async createVoucher(voucherData, accessToken) {
    const currency = localStorage.getItem("currency") || defaultCurrency;
    try {
      const response = await axios.post(
        `${this.URL}api/voucher/redeem/`,
        voucherData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Koristite access token za autorizaciju
            "Content-Type": "application/json",
            Currency: currency,
          },
        }
      );
      return response.data; // Očekuje se da backend vraća ažuriranu adresu
    } catch (error) {
      throw error;
    }
  }

  static async getUserPointsHistory(accessToken) {
    const language = i18next.language.toLowerCase();
    try {
      const response = await axios.get(`${this.URL}api/points-history/`, {
        headers: {
          "Accept-Language": language,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data; // Vraćanje dobijenih podataka
    } catch (error) {
      throw error;
    }
  }

  //Resetovanje Passworda
  static async ResetPasswordRequest(email) {
    const language = i18next.language.toLowerCase();
    try {
      const response = await axios.post(
        this.URL + "api/password-reset-request/",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": language,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  static async ResetPassword(uid, token, newPassword) {
    try {
      const response = await axios.post(
        this.URL + `api/password-reset-confirm/${uid}/${token}/`,
        {
          password: newPassword,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //SUBSCRIBE
  static async subscribe(email) {
    const language = i18next.language.toLowerCase(); // Pretpostavljamo da i18next upravlja trenutnim jezikom
    try {
      const response = await axios.post(
        `${this.URL}email/subscribe/`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": language,
          },
        }
      );
      return response.data; // Očekuje se da backend vraća ažuriranu adresu
    } catch (error) {
      throw error;
    }
  }
  //BLOGS
  static async GetAllBlogs() {
    const language = i18next.language.toLowerCase();
    try {
      const response = await axios.get(`${this.URL}api/blogs/`, {
        headers: {
          "Accept-Language": language,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  static async GetBlogBySlug(slug) {
    const language = i18next.language.toLowerCase();
    try {
      const response = await axios.get(`${this.URL}api/blogs/${slug}/`, {
        headers: {
          "Accept-Language": language,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  //STRIPE
  static async CreatePaymentIntent(data, accessToken) {
    const currency = localStorage.getItem("currency") || defaultCurrency;

    try {
      const response = await axios.post(
        `${this.URL}api/create-payment-intent/`,
        {
          amount: data.amount,
          email: data.email,
          billing_details: data.billing_details,
          description: data.description,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Currency: currency,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Očekujemo clientSecret kao odgovor
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  }
  static async SavePaymentDetails(paymentMethodId, accessToken) {
    try {
      const response = await axios.post(
        `${this.URL}api/save-payment-details/`,
        {
          payment_method_id: paymentMethodId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Očekujemo poruku o uspešnom čuvanju
    } catch (error) {
      console.error(
        "Error saving payment details:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
  static async getSavedPaymentMethods(accessToken) {
    try {
      const response = await axios.get(`${this.URL}api/get-payment-methods/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching saved payment methods:", error);
      throw error;
    }
  }

  static async removePaymentMethod(paymentMethodId, accessToken) {
    try {
      const response = await axios.delete(
        `${this.URL}api/remove-payment-method/${paymentMethodId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error removing payment method:", error);
      throw error;
    }
  }

  static async getFeaturedGroup(slug) {
    try {
      const response = await axios.get(
        `${this.URL}api/featured-group/${slug}/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching featured group:", error);
      throw error;
    }
  }

  //KORPA
  static async FetchCart() {
    const token = localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens")).access
      : null;
    if (token) {
      try {
        const response = await axios.get(`${this.URL}api/cart/`, {
          headers: {
            Authorization: `Bearer ${token.access}`,
          },
        });

        return response.data; // Očekuje se da će ovaj poziv vratiti trenutno stanje korpe
      } catch (error) {
        throw error;
      }
    }
  }
  static async AddToCart(product, quantity) {
    try {
      const token = JSON.parse(localStorage.getItem("authTokens")).access;

      const response = await axios.post(
        `${this.URL}api/cart/add/`,
        {
          product_id: product.id, // Ako je potrebno, prilagodite ključeve prema vašem API-ju
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data; // Očekuje se poruka o uspešnom dodavanju stavke u korpu
    } catch (error) {
      throw error;
    }
  }
  static async UpdateCartItem(cartItemId, newQuantity) {
    try {
      const token = JSON.parse(localStorage.getItem("authTokens")).access;

      const response = await axios.patch(
        `${this.URL}api/cart/update/${cartItemId}/`,
        {
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data; // Očekuje se poruka o uspešnom ažuriranju stavke u korpi
    } catch (error) {
      throw error;
    }
  }
  static async RemoveFromCart(cartItemId) {
    try {
      const token = JSON.parse(localStorage.getItem("authTokens")).access;

      const response = await axios.delete(
        `${this.URL}api/cart/remove/${cartItemId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.status; // Očekuje se status 204 No Content ukoliko je stavka uspešno uklonjena
    } catch (error) {
      throw error;
    }
  }
  static async SyncCart(cartItems) {
    try {
      const token = JSON.parse(localStorage.getItem("authTokens")).access;
      const response = await axios.post(
        `${this.URL}api/cart/sync/`,
        { items: cartItems },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Očekuje se ažurirano stanje korpe sa backend-a
    } catch (error) {
      throw error;
    }
  }

  /** Admin: lista porudžbina (`is_staff`). Parametri: `q`, `queue` (all|to_send|sent), `status`. */
  static async adminListOrders(accessToken, { q, queue, status } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", String(q).trim());
    if (queue) params.set("queue", queue);
    if (status) params.set("status", status);
    const qs = params.toString();
    const url = `${this.URL}api/admin/orders/${qs ? `?${qs}` : ""}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  static async adminGetOrder(accessToken, orderId) {
    const response = await axios.get(`${this.URL}api/admin/orders/${orderId}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  /** Masovna promena statusa: `{ order_ids: number[], order_status: string }` */
  static async adminBulkOrderStatus(accessToken, order_ids, order_status) {
    const response = await axios.post(
      `${this.URL}api/admin/orders/bulk-status/`,
      { order_ids, order_status },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  static async adminPatchOrderStatus(accessToken, orderId, order_status) {
    const response = await axios.patch(
      `${this.URL}api/admin/orders/${orderId}/`,
      { order_status },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  static async adminPatchOrderItemShipped(accessToken, orderId, itemId, is_shipped) {
    const response = await axios.patch(
      `${this.URL}api/admin/orders/${orderId}/items/${itemId}/`,
      { is_shipped },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  static async adminMarkAllShipped(accessToken, orderId) {
    const response = await axios.post(
      `${this.URL}api/admin/orders/${orderId}/mark-all-shipped/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }
}
