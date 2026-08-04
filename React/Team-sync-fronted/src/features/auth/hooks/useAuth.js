import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../state/auth/authAction.jsx';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onRegisterSubmit = (data) => {
    console.log("Register data:", data);
  };

  const onLoginSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return {
    register,
    handleSubmit,
    errors,
    onRegisterSubmit,
    onLoginSubmit,
    navigate
  };
};