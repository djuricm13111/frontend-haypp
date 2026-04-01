import { useContext, useCallback, useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { AuthUserContext } from "../../context/AuthUserContext";

const MAX_ADDRESSES = 5;

const inputBase = `
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--bg-300);
  border-radius: var(--border-radius-base);
  font-size: 15px;
  font-family: inherit;
  background: var(--bg-100);
  color: var(--text-100);
  &:focus {
    outline: 2px solid var(--primary-100);
    outline-offset: 0;
    border-color: var(--primary-200);
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-200);
  margin-bottom: var(--spacing-md);
`;

const Input = styled.input`
  ${inputBase}
`;

const Select = styled.select`
  ${inputBase}
  cursor: pointer;
`;

const Muted = styled.p`
  margin: 0 0 var(--spacing-md);
  font-size: 14px;
  color: var(--text-200);
  line-height: 1.5;
`;

const Hint = styled.p`
  margin: 0 0 var(--spacing-sm);
  font-size: 13px;
  color: var(--text-200);
  line-height: 1.45;
`;

const ErrorText = styled.p`
  margin: 0 0 var(--spacing-sm);
  font-size: 14px;
  color: var(--error-color, #b71c1c);
`;

const AddressCard = styled.div`
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--bg-300);
  border-radius: var(--border-radius-base);
  background: var(--bg-200);
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const AddressLines = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-100);
  margin-bottom: var(--spacing-sm);
`;

const Badge = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--primary-100);
  color: var(--bg-100);
  margin-bottom: 8px;
`;

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const Btn = styled.button`
  padding: 8px 14px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--primary-200);
  background: var(--bg-100);
  color: var(--primary-200);
  &:hover {
    background: var(--bg-200);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const BtnPrimary = styled(Btn)`
  background: var(--primary-200);
  color: var(--bg-100);
  border-color: transparent;
  &:hover {
    background: var(--primary-100);
  }
`;

const BtnDanger = styled(Btn)`
  border-color: var(--error-color, #cf6679);
  color: var(--error-color, #b71c1c);
  &:hover {
    background: #ffebee;
  }
`;

const AddressForm = styled.form`
  display: block;
  margin-top: var(--spacing-sm);
`;

function emptyForm() {
  return {
    country: "",
    city: "",
    postal_code: "",
    street: "",
    street_number: "",
    secondary_street: "",
    building_number: "",
    phone_number: "",
    type: "Home",
  };
}

function addrToForm(addr) {
  return {
    country: addr.country || "",
    city: addr.city || "",
    postal_code: addr.postal_code || "",
    street: addr.street || "",
    street_number: addr.street_number || "",
    secondary_street: addr.secondary_street || "",
    building_number: addr.building_number || "",
    phone_number: addr.phone_number || "",
    type: addr.type || "Home",
  };
}

function formatAddressLines(addr) {
  const line1 = [addr.street, addr.street_number, addr.secondary_street]
    .filter(Boolean)
    .join(" ");
  const line2 = [addr.postal_code, addr.city, addr.country].filter(Boolean).join(", ");
  return { line1, line2 };
}

function apiErrMessage(err, fallback) {
  const d = err?.response?.data;
  if (typeof d === "string") return d;
  if (d?.error) return d.error;
  if (d?.detail) return d.detail;
  if (typeof d === "object" && d !== null) {
    const first = Object.values(d)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
  }
  return fallback;
}

/**
 * Lista adresa na nalogu: dodavanje, izmena, podrazumevana, brisanje (API pravila).
 */
export default function UserAddressBookSection() {
  const { t } = useTranslation();
  const {
    userProfile,
    fetchUserData,
    createAddressBook,
    updateAddressBook,
    deleteAddressBook,
    invalidateUserProfileCache,
  } = useContext(AuthUserContext);

  const addresses = useMemo(
    () => (Array.isArray(userProfile?.addresses) ? userProfile.addresses : []),
    [userProfile?.addresses]
  );

  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(null);

  const resetForms = useCallback(() => {
    setAddOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setLocalError(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      invalidateUserProfileCache();
      await fetchUserData();
    } catch {
      /* fetchUserData već loguje */
    }
  }, [fetchUserData, invalidateUserProfileCache]);

  const openAdd = () => {
    setLocalError(null);
    setEditingId(null);
    setForm(emptyForm());
    setAddOpen(true);
  };

  const openEdit = (addr) => {
    setLocalError(null);
    setAddOpen(false);
    setEditingId(addr.id);
    setForm(addrToForm(addr));
  };

  const onField = (key) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [key]: v }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (addresses.length >= MAX_ADDRESSES) {
      setLocalError(t("ACCOUNT.ADDRESS_LIMIT", { max: MAX_ADDRESSES }));
      return;
    }
    setBusy(true);
    try {
      await createAddressBook({
        country: form.country.trim(),
        city: form.city.trim(),
        postal_code: form.postal_code.trim(),
        street: form.street.trim(),
        street_number: form.street_number.trim() || null,
        secondary_street: form.secondary_street.trim() || null,
        building_number: form.building_number.trim() || null,
        phone_number: form.phone_number.trim() || null,
        type: form.type || "Home",
        is_primary: addresses.length === 0,
      });
      await refresh();
      resetForms();
    } catch (err) {
      setLocalError(apiErrMessage(err, t("ACCOUNT.ADDRESS_SAVE_ERROR")));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setLocalError(null);
    setBusy(true);
    try {
      await updateAddressBook(editingId, {
        country: form.country.trim(),
        city: form.city.trim(),
        postal_code: form.postal_code.trim(),
        street: form.street.trim(),
        street_number: form.street_number.trim() || null,
        secondary_street: form.secondary_street.trim() || null,
        building_number: form.building_number.trim() || null,
        phone_number: form.phone_number.trim() || null,
        type: form.type || "Home",
      });
      await refresh();
      resetForms();
    } catch (err) {
      setLocalError(apiErrMessage(err, t("ACCOUNT.ADDRESS_SAVE_ERROR")));
    } finally {
      setBusy(false);
    }
  };

  const handleSetPrimary = async (addr) => {
    if (addr.is_primary) return;
    setLocalError(null);
    setBusy(true);
    try {
      await updateAddressBook(addr.id, { is_primary: true });
      await refresh();
    } catch (err) {
      setLocalError(apiErrMessage(err, t("ACCOUNT.ADDRESS_SAVE_ERROR")));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (addr) => {
    if (addr.is_primary) return;
    if (
      !window.confirm(
        t("ACCOUNT.ADDRESS_DELETE_CONFIRM", {
          label: [addr.city, addr.street].filter(Boolean).join(", ") || `#${addr.id}`,
        })
      )
    ) {
      return;
    }
    setLocalError(null);
    setBusy(true);
    try {
      await deleteAddressBook(addr.id);
      await refresh();
      if (editingId === addr.id) resetForms();
    } catch (err) {
      setLocalError(apiErrMessage(err, t("ACCOUNT.ADDRESS_DELETE_ERROR")));
    } finally {
      setBusy(false);
    }
  };

  const renderForm = (isEdit) => (
    <AddressForm onSubmit={isEdit ? handleUpdate : handleCreate}>
      <Field>
        {t("ACCOUNT.ADDRESS_COUNTRY")}
        <Input value={form.country} onChange={onField("country")} required autoComplete="country-name" />
      </Field>
      <Field>
        {t("ACCOUNT.ADDRESS_CITY")}
        <Input value={form.city} onChange={onField("city")} required autoComplete="address-level2" />
      </Field>
      <Field>
        {t("ACCOUNT.ADDRESS_POSTAL")}
        <Input value={form.postal_code} onChange={onField("postal_code")} required autoComplete="postal-code" />
      </Field>
      <Field>
        {t("ACCOUNT.ADDRESS_STREET")}
        <Input value={form.street} onChange={onField("street")} required autoComplete="street-address" />
      </Field>
      <Field>
        {t("ACCOUNT.ADDRESS_STREET_NUMBER")}
        <Input value={form.street_number} onChange={onField("street_number")} autoComplete="off" />
      </Field>
      <Field>
        {t("ACCOUNT.ADDRESS_SECONDARY")}
        <Input value={form.secondary_street} onChange={onField("secondary_street")} autoComplete="off" />
      </Field>
      <Field>
        {t("ACCOUNT.ADDRESS_BUILDING")}
        <Input value={form.building_number} onChange={onField("building_number")} autoComplete="off" />
      </Field>
      <Field>
        {t("ACCOUNT.ADDRESS_PHONE")}
        <Input value={form.phone_number} onChange={onField("phone_number")} type="tel" autoComplete="tel" />
      </Field>
      <Field>
        {t("ACCOUNT.ADDRESS_TYPE_LABEL")}
        <Select value={form.type} onChange={onField("type")}>
          <option value="Home">{t("ACCOUNT.ADDRESS_TYPE_HOME")}</option>
          <option value="Work">{t("ACCOUNT.ADDRESS_TYPE_WORK")}</option>
          <option value="Other">{t("ACCOUNT.ADDRESS_TYPE_OTHER")}</option>
        </Select>
      </Field>
      <BtnRow>
        <BtnPrimary type="submit" disabled={busy}>
          {busy ? "…" : isEdit ? t("ACCOUNT.ADDRESS_SAVE_EDIT") : t("ACCOUNT.ADDRESS_SAVE_NEW")}
        </BtnPrimary>
        <Btn type="button" disabled={busy} onClick={resetForms}>
          {t("ACCOUNT.ADDRESS_CANCEL")}
        </Btn>
      </BtnRow>
    </AddressForm>
  );

  return (
    <div>
      {localError && <ErrorText role="alert">{localError}</ErrorText>}

      {addresses.length === 0 && !addOpen && (
        <Muted>{t("ACCOUNT.NO_ADDRESSES")}</Muted>
      )}

      {addresses.map((addr) => {
        const { line1, line2 } = formatAddressLines(addr);
        const isEditing = editingId === addr.id;
        const onlyOne = addresses.length === 1;
        const canDelete = !addr.is_primary;

        return (
          <AddressCard key={addr.id}>
            {addr.is_primary && <Badge>{t("ACCOUNT.PRIMARY")}</Badge>}
            {!isEditing && (
              <>
                <AddressLines>
                  {line1}
                  <br />
                  {line2}
                  {addr.phone_number && (
                    <>
                      <br />
                      {addr.phone_number}
                    </>
                  )}
                </AddressLines>
                <BtnRow>
                  <Btn type="button" disabled={busy} onClick={() => openEdit(addr)}>
                    {t("ACCOUNT.ADDRESS_EDIT")}
                  </Btn>
                  {!addr.is_primary && (
                    <Btn type="button" disabled={busy} onClick={() => handleSetPrimary(addr)}>
                      {t("ACCOUNT.ADDRESS_SET_PRIMARY")}
                    </Btn>
                  )}
                  {canDelete ? (
                    <BtnDanger type="button" disabled={busy} onClick={() => handleDelete(addr)}>
                      {t("ACCOUNT.ADDRESS_DELETE")}
                    </BtnDanger>
                  ) : (
                    <Hint>
                      {onlyOne
                        ? t("ACCOUNT.ADDRESS_HINT_SINGLE")
                        : t("ACCOUNT.ADDRESS_HINT_PRIMARY")}
                    </Hint>
                  )}
                </BtnRow>
              </>
            )}
            {isEditing && renderForm(true)}
          </AddressCard>
        );
      })}

      {addOpen && (
        <AddressCard>
          <Muted style={{ marginBottom: 8, fontWeight: 600 }}>{t("ACCOUNT.ADDRESS_NEW_TITLE")}</Muted>
          {renderForm(false)}
        </AddressCard>
      )}

      {!addOpen && !editingId && addresses.length < MAX_ADDRESSES && (
        <BtnRow style={{ marginTop: addresses.length ? 12 : 0 }}>
          <BtnPrimary type="button" disabled={busy} onClick={openAdd}>
            {t("ACCOUNT.ADDRESS_ADD")}
          </BtnPrimary>
        </BtnRow>
      )}

      {addresses.length >= MAX_ADDRESSES && (
        <Hint>{t("ACCOUNT.ADDRESS_LIMIT", { max: MAX_ADDRESSES })}</Hint>
      )}
    </div>
  );
}
