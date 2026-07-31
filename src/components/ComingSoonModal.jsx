import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import APIService from "../services/APIService";

const ComingSoonModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | duplicate | error
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await APIService.subscribe(email.trim());
      setStatus(res?.message === "already_subscribed" ? "duplicate" : "success");
    } catch (err) {
      console.error("subscribe error", err?.response?.status, err?.response?.data);
      const s = err?.response?.status;
      setStatus(s === 409 || s === 400 ? "duplicate" : "error");
    }
  };

  return (
    <Overlay ref={overlayRef} onClick={handleOverlayClick}>
      <Modal>
        <CloseButton onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </CloseButton>

        <IconWrap>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--primary-100)" opacity="0.15"/>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="var(--primary-100)" strokeWidth="1.5"/>
            <circle cx="12" cy="9" r="2.5" fill="var(--primary-100)"/>
          </svg>
        </IconWrap>

        <Heading>Orders opening soon</Heading>
        <Subtext>
          We're setting up delivery to your region. Leave your email and we'll
          notify you the moment orders go live.
        </Subtext>

        {status === "success" ? (
          <SuccessBox>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            You're on the list! We'll let you know as soon as we're ready.
          </SuccessBox>
        ) : (
          <Form onSubmit={handleSubmit}>
            <InputRow>
              <EmailInput
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                required
                autoFocus
              />
              <SubmitButton type="submit" disabled={status === "loading"}>
                {status === "loading" ? "..." : "Notify me"}
              </SubmitButton>
            </InputRow>
            {status === "duplicate" && (
              <HintText $error={false}>You're already on the list.</HintText>
            )}
            {status === "error" && (
              <HintText $error={true}>Something went wrong. Please try again.</HintText>
            )}
          </Form>
        )}
      </Modal>
    </Overlay>
  );
};

export default ComingSoonModal;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  animation: ${fadeIn} 0.18s ease;
`;

const Modal = styled.div`
  position: relative;
  background: var(--bg-100);
  border-radius: 16px;
  padding: 40px 32px 36px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  animation: ${slideUp} 0.22s ease;
  text-align: center;

  @media (max-width: 480px) {
    padding: 36px 20px 28px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  color: var(--text-200);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    color: var(--text-100);
    background: var(--bg-200);
  }
`;

const IconWrap = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
`;

const Heading = styled.h2`
  font-family: "Oswald-Medium", sans-serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-100);
  margin: 0 0 10px;
`;

const Subtext = styled.p`
  font-family: "Montserrat";
  font-size: 0.9rem;
  color: var(--text-200);
  line-height: 1.6;
  margin: 0 0 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 400px) {
    flex-direction: column;
  }
`;

const EmailInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: 1.5px solid var(--bg-300);
  border-radius: 8px;
  font-family: "Montserrat";
  font-size: 0.9rem;
  background: var(--bg-100);
  color: var(--text-100);
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--primary-100);
  }

  &::placeholder {
    color: var(--text-300, #aaa);
  }
`;

const SubmitButton = styled.button`
  padding: 12px 20px;
  background: var(--primary-100);
  color: var(--bg-100);
  border: none;
  border-radius: 8px;
  font-family: "Oswald-Medium", sans-serif;
  font-size: 1rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--primary-200);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const SuccessBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--bg-200);
  border-radius: 10px;
  font-family: "Montserrat";
  font-size: 0.9rem;
  color: var(--text-100);
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    color: var(--primary-100);
  }
`;

const HintText = styled.p`
  font-family: "Montserrat";
  font-size: 0.8125rem;
  margin: 0;
  color: ${({ $error }) => ($error ? "#c0392b" : "var(--text-200)")};
`;
