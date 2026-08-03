import { useForm } from "react-hook-form";
import {useNavigate} from 'react-router-dom'

 export const useAuth = () => {
    const navigate = useNavigate();
    const 
    {
        register,
        handleSubmit,
        formState: { errors },

    } = useForm();

    const  onRegistersubmit = (data) => {
        console.log(data);  
    };

    const onLoginSubmit = (data) => {
        console.log(data);
    };

    return {

        register,
        handleSubmit,
        errors,
        onRegistersubmit,
        onLoginSubmit,
        navigate
    };    
    };