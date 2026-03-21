import { useNavigate } from "react-router-dom";

export function useNavigation() {
  const navigate = useNavigate();

  function goToHome() {
    navigate("/");
  }



  return { goToHome };
}
